/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { account, APPWRITE_READY, databases, APPWRITE_CONFIG } from '../lib/appwrite';
import { ID, OAuthProvider, Query } from 'appwrite';

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

    useEffect(() => {
        if (APPWRITE_READY) {
            account.get().then((awUser) => {
                const saved = localStorage.getItem(`linkzy_profile_${awUser.$id}`);
                const extra = saved ? JSON.parse(saved) : {};
                setUser(buildUserFromAppwrite(awUser, extra));
                setIsLoading(false);
            }).catch(() => {
                setUser(null);
                localStorage.removeItem(SESSION_KEY);
                setIsLoading(false);
            });
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
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
        // Initiates OAuth and navigates away
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
        if (APPWRITE_READY) {
            account.deleteSession('current').finally(() => {
                setUser(null);
                localStorage.removeItem(SESSION_KEY);
            });
        } else {
            setUser(null);
            localStorage.removeItem(SESSION_KEY);
        }
    };

    // ── updateUser: persist local & remote ──
    const updateUser = (updates: Partial<User>) => {
        setUser((prev) => {
            if (!prev) return null;
            const updated = { ...prev, ...updates };

            if (APPWRITE_READY && prev.id) {
                // Save locally first
                localStorage.setItem(`linkzy_profile_${prev.id}`, JSON.stringify(updated));
                localStorage.setItem(SESSION_KEY, JSON.stringify(updated));

                // Sync to Appwrite Database (Fire and forget, ignoring awaits so it doesn't block UI)
                databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.profilesCollectionId,
                    [Query.equal('userId', prev.id)]
                ).then(res => {
                    const dbPayload = {
                        userId: updated.id,
                        username: updated.username || '',
                        displayName: updated.name || '',
                        bio: updated.bio || '',
                        avatarUrl: updated.avatarUrl || '',
                        bannerUrl: updated.bannerUrl || '',
                        bgColor: updated.bgColor || '',
                        bgImage: updated.bgImage || '',
                        theme: updated.theme || 'editorial-light',
                        links: JSON.stringify(updated.links || []),
                        blocks: JSON.stringify(updated.blocks || [])
                    };

                    if (res.documents.length > 0) {
                        databases.updateDocument(
                            APPWRITE_CONFIG.databaseId,
                            APPWRITE_CONFIG.profilesCollectionId,
                            res.documents[0].$id,
                            dbPayload
                        ).catch(e => {
                            console.error('Failed to update remote profile:', e);
                            setUser(prev); // Rollback on failure
                        });
                    } else {
                        databases.createDocument(
                            APPWRITE_CONFIG.databaseId,
                            APPWRITE_CONFIG.profilesCollectionId,
                            ID.unique(),
                            dbPayload
                        ).catch(e => {
                            console.error('Failed to create remote profile:', e);
                            setUser(prev); // Rollback on failure
                        });
                    }
                }).catch(e => console.error('Failed to fetch profile array for sync:', e));

            } else {
                localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
            }
            return updated;
        });
    };

    const value = { user, isLoading, login, loginWithGoogle, signup, logout, updateUser };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
