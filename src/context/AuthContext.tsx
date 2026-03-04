/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { account, APPWRITE_READY, databases, APPWRITE_CONFIG } from '../lib/appwrite';
import { ID, OAuthProvider, Query, Permission, Role } from 'appwrite';

// ── Block / User types ──────────────────────────────────────────────────────
export interface LinkBlock {
    id: string; type: 'link'; label: string; url: string; icon: string; enabled: boolean;
}
export interface MusicBlock {
    id: string; type: 'music'; title: string; artist: string; embedUrl: string; coverUrl?: string; enabled: boolean;
}
export interface PhotoBlock {
    id: string; type: 'photo'; caption?: string; images: string[]; enabled: boolean;
}
export interface ProductBlock {
    id: string; type: 'product'; name: string; price: string; imageUrl?: string; buyUrl: string; enabled: boolean;
}
export type Block = LinkBlock | MusicBlock | PhotoBlock | ProductBlock;
export type LinkItem = LinkBlock;

export interface User {
    id: string;
    name: string;
    email: string;
    plan: 'free' | 'pro' | 'business';
    username?: string;
    bio?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    bgColor?: string;
    bgImage?: string;
    links: LinkItem[];
    blocks: Block[];
    theme: string;
}

// ── Context type ─────────────────────────────────────────────────────────────
interface AuthContextValue {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => void;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── localStorage helpers ─────
const STORAGE_KEY = 'linkzy_users';
const SESSION_KEY = 'linkzy_session';

function getStoredUsers(): Record<string, { password: string; user: User }> {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
}

function getDefaultLinks(): LinkItem[] {
    return [];
}

// Convert an Appwrite User into our standard User shape
function buildUserFromAppwrite(awUser: import('appwrite').Models.User<import('appwrite').Models.Preferences>, extra?: Partial<User>): User {
    const email = awUser.email ?? '';
    return {
        id: awUser.$id,
        name: awUser.name || email.split('@')[0],
        email,
        plan: 'free',
        username: email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase(),
        bio: '',
        avatarUrl: '',
        bannerUrl: '',
        bgColor: '',
        bgImage: '',
        links: getDefaultLinks(),
        blocks: [],
        theme: 'editorial-light',
        ...extra,
    };
}

// ── Standalone async DB sync — runs OUTSIDE React state ─────────────────────
// Caches the Appwrite document ID per userId so we don't list on every save
const docIdCache: Record<string, string> = {};

async function syncProfileToAppwrite(updated: User): Promise<void> {
    const dbPayload = {
        userId: updated.id,
        username: (updated.username || '').slice(0, 50),
        displayName: (updated.name || '').slice(0, 100),
        bio: (updated.bio || '').slice(0, 500),
        avatarUrl: updated.avatarUrl || '',
        bannerUrl: updated.bannerUrl || '',
        bgColor: updated.bgColor || '',
        bgImage: updated.bgImage || '',
        theme: updated.theme || 'editorial-light',
        links: JSON.stringify(updated.links || []),
        blocks: JSON.stringify(updated.blocks || []),
    };

    // Check cache first
    let docId = docIdCache[updated.id];

    if (!docId) {
        const res = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.profilesCollectionId,
            [Query.equal('userId', updated.id)]
        );
        if (res.documents.length > 0) {
            docId = res.documents[0].$id;
            docIdCache[updated.id] = docId;
        }
    }

    if (docId) {
        try {
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.profilesCollectionId,
                docId,
                dbPayload,
                [
                    Permission.read(Role.any()),
                    Permission.write(Role.user(updated.id))
                ]
            );
            console.log('✅ Appwrite Sync: Success');
        } catch (err: any) {
            console.error('❌ Appwrite Sync: Update Failed', { error: err, payload: dbPayload });

            // Safe Isolation Mode: Try fields individually to find the bottleneck
            if (err.code === 500 || err.code === 400) {
                console.warn('⚠️ Safe Mode: Attempting to save fields individually...');
                const fields = Object.entries(dbPayload);
                for (const [key, value] of fields) {
                    if (key === 'userId') continue;
                    try {
                        await databases.updateDocument(
                            APPWRITE_CONFIG.databaseId,
                            APPWRITE_CONFIG.profilesCollectionId,
                            docId,
                            { [key]: value }
                        );
                        console.log(`✅ Safe Sync: Saved "${key}"`);
                    } catch (fieldErr) {
                        console.error(`❌ Safe Sync: Failed to save "${key}"`, fieldErr);
                    }
                }
            }
        }
    } else {
        try {
            const created = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.profilesCollectionId,
                ID.unique(),
                dbPayload,
                [
                    Permission.read(Role.any()),
                    Permission.write(Role.user(updated.id))
                ]
            );
            docIdCache[updated.id] = created.$id;
            console.log('✅ Appwrite Sync: Created Success');
        } catch (err: any) {
            console.error('❌ Appwrite Sync: Create Failed', { error: err, payload: dbPayload });
            // Fallback for creation: try basic fields first
            if (err.code === 500) {
                console.warn('⚠️ Fallback: Creating with basic fields...');
                const basicPayload = { ...dbPayload, links: '[]', blocks: '[]' };
                const fallback = await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.profilesCollectionId,
                    ID.unique(),
                    basicPayload,
                    [Permission.read(Role.any()), Permission.write(Role.user(updated.id))]
                ).catch(e => { console.error('❌ Fallback failed:', e); throw e; });
                if (fallback) docIdCache[updated.id] = fallback.$id;
            }
        }
    }
}

// Helper to parse Appwrite JSON fields (handles string and array cases)
function parseField(raw: unknown): unknown[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return []; }
    }
    return [];
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        // Optimistic restore
        const session = localStorage.getItem(SESSION_KEY);
        if (session) {
            try {
                const parsed = JSON.parse(session);
                if (parsed.bio === 'Hey there! I use Linkzy.') parsed.bio = '';
                return parsed;
            } catch { localStorage.removeItem(SESSION_KEY); }
        }
        return null;
    });
    const [isLoading, setIsLoading] = useState(true);
    // Ref so async functions always read the latest user without stale closures
    const userRef = useRef(user);
    useEffect(() => { userRef.current = user; }, [user]);

    useEffect(() => {
        if (APPWRITE_READY) {
            account.get().then(async (awUser) => {
                try {
                    // Fetch the latest profile from the database (source of truth)
                    const res = await databases.listDocuments(
                        APPWRITE_CONFIG.databaseId,
                        APPWRITE_CONFIG.profilesCollectionId,
                        [Query.equal('userId', awUser.$id)]
                    );

                    let extra: Partial<User> = {};
                    if (res.documents.length > 0) {
                        const doc = res.documents[0];
                        docIdCache[awUser.$id] = doc.$id;
                        extra = {
                            username: doc.username || undefined,
                            name: doc.displayName || undefined,
                            bio: doc.bio || '',
                            avatarUrl: doc.avatarUrl || '',
                            bannerUrl: doc.bannerUrl || '',
                            bgColor: doc.bgColor || '',
                            bgImage: doc.bgImage || '',
                            theme: doc.theme || 'editorial-light',
                            links: parseField(doc.links) as LinkItem[],
                            blocks: parseField(doc.blocks) as Block[],
                        };
                    } else {
                        // No document yet — fall back to localStorage
                        const saved = localStorage.getItem(`linkzy_profile_${awUser.$id}`);
                        if (saved) extra = JSON.parse(saved);
                    }

                    const freshUser = buildUserFromAppwrite(awUser, extra);
                    setUser(freshUser);
                    localStorage.setItem(SESSION_KEY, JSON.stringify(freshUser));
                    localStorage.setItem(`linkzy_profile_${awUser.$id}`, JSON.stringify(freshUser));
                } catch {
                    // DB fetch failed — fall back to localStorage snapshot
                    const saved = localStorage.getItem(`linkzy_profile_${awUser.$id}`);
                    const extra = saved ? JSON.parse(saved) : {};
                    setUser(buildUserFromAppwrite(awUser, extra));
                }
                setIsLoading(false);
            }).catch(() => {
                setUser(null);
                localStorage.removeItem(SESSION_KEY);
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, []);

    // ── Email/password login ──
    const login = async (email: string, password: string) => {
        if (APPWRITE_READY) {
            try {
                await account.createEmailPasswordSession(email, password);
                const awUser = await account.get();
                const saved = localStorage.getItem(`linkzy_profile_${awUser.$id}`);
                const extra = saved ? JSON.parse(saved) : {};
                const finalUser = buildUserFromAppwrite(awUser, extra);
                if (finalUser.bio === 'Hey there! I use Linkzy.') finalUser.bio = '';
                setUser(finalUser);
                localStorage.setItem(SESSION_KEY, JSON.stringify(finalUser));
            } catch (err: unknown) {
                const error = err as { code?: string; message?: string };
                throw new Error(error.message || 'Login failed.');
            }
        } else {
            const users = getStoredUsers();
            const entry = users[email.toLowerCase()];
            if (!entry || entry.password !== password) throw new Error('Invalid email or password.');
            setUser(entry.user);
            localStorage.setItem(SESSION_KEY, JSON.stringify(entry.user));
        }
    };

    // ── Google OAuth login ──
    const loginWithGoogle = () => {
        if (!APPWRITE_READY) {
            throw new Error('Appwrite is not configured. Add VITE_APPWRITE_* variables to .env.local');
        }
        account.createOAuth2Session(
            OAuthProvider.Google,
            window.location.origin + '/auth/callback',
            window.location.origin + '/login'
        );
    };

    // ── Signup ──
    const signup = async (name: string, email: string, password: string) => {
        if (APPWRITE_READY) {
            try {
                await account.create(ID.unique(), email, password, name);
                await account.createEmailPasswordSession(email, password);
                const awUser = await account.get();
                const u = buildUserFromAppwrite(awUser);
                setUser(u);
                localStorage.setItem(SESSION_KEY, JSON.stringify(u));
                localStorage.setItem(`linkzy_profile_${u.id}`, JSON.stringify(u));
            } catch (err: unknown) {
                const error = err as { code?: string; message?: string };
                throw new Error(error.message || 'Signup failed.');
            }
        } else {
            const users = getStoredUsers();
            const key = email.toLowerCase();
            if (users[key]) throw new Error('An account with this email already exists.');
            const newUser: User = {
                id: crypto.randomUUID(), name, email: key, plan: 'free',
                username: key.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase(),
                bio: 'Hey there! I use Linkzy.',
                avatarUrl: '', bannerUrl: '', bgColor: '', bgImage: '',
                links: getDefaultLinks(), blocks: [], theme: 'editorial-light',
            };
            users[key] = { password, user: newUser };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
            setUser(newUser);
            localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
        }
    };

    // ── Logout ──
    const logout = () => {
        setUser(null);
        localStorage.removeItem(SESSION_KEY);
        if (APPWRITE_READY) {
            account.deleteSession('current').catch(() => { /* ignore — session may already be gone */ });
        }
    };

    // ── updateUser: properly async, runs DB sync OUTSIDE setState ──
    const updateUser = (updates: Partial<User>) => {
        const prev = userRef.current;
        if (!prev) return;

        const updated = { ...prev, ...updates };

        // 1. Update React state immediately for optimistic UI
        setUser(updated);

        // 2. Persist locally — always, even if DB sync fails
        localStorage.setItem(`linkzy_profile_${prev.id}`, JSON.stringify(updated));
        localStorage.setItem(SESSION_KEY, JSON.stringify(updated));

        // 3. Sync to Appwrite DB asynchronously — OUTSIDE setState
        if (APPWRITE_READY && prev.id) {
            syncProfileToAppwrite(updated).catch(e => {
                console.error('DB sync failed (changes saved locally):', e);
                // Do NOT rollback — keep local changes. DB will update on next successful sync.
            });
        }
    };

    const value = { user, isLoading, login, loginWithGoogle, signup, logout, updateUser };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
