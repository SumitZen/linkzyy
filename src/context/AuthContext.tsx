import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase, SUPABASE_READY } from '../lib/supabase';

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
    loginWithGoogle: () => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── localStorage helpers (used as fallback when Supabase not configured) ─────
const STORAGE_KEY = 'linkzy_users';
const SESSION_KEY = 'linkzy_session';

function getStoredUsers(): Record<string, { password: string; user: User }> {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
}

function getDefaultLinks(): LinkItem[] {
    return [
        { id: '1', type: 'link', label: 'My Portfolio', url: 'https://example.com', icon: 'globe', enabled: true },
        { id: '2', type: 'link', label: 'Newsletter', url: 'https://example.com/newsletter', icon: 'email', enabled: true },
        { id: '3', type: 'link', label: 'Instagram', url: 'https://instagram.com', icon: 'instagram', enabled: true },
    ];
}

function buildUserFromSupabase(sbUser: { id: string; email?: string | null; user_metadata?: Record<string, string> }, extra?: Partial<User>): User {
    const email = sbUser.email ?? '';
    const meta = sbUser.user_metadata ?? {};
    return {
        id: sbUser.id,
        name: meta['full_name'] ?? meta['name'] ?? email.split('@')[0],
        email,
        plan: 'free',
        username: email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase(),
        bio: 'Hey there! I use Linkzy.',
        avatarUrl: meta['avatar_url'] ?? meta['picture'] ?? '',
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
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // ── Init: restore session ──
    useEffect(() => {
        if (SUPABASE_READY) {
            // Supabase: listen to auth state
            supabase.auth.getSession().then(({ data }) => {
                if (data.session?.user) {
                    const saved = localStorage.getItem(`linkzy_profile_${data.session.user.id}`);
                    const extra = saved ? JSON.parse(saved) : {};
                    setUser(buildUserFromSupabase(data.session.user, extra));
                }
                setIsLoading(false);
            });

            const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
                if (session?.user) {
                    const saved = localStorage.getItem(`linkzy_profile_${session.user.id}`);
                    const extra = saved ? JSON.parse(saved) : {};
                    setUser(buildUserFromSupabase(session.user, extra));
                } else {
                    setUser(null);
                }
            });
            return () => listener.subscription.unsubscribe();
        } else {
            // Fallback: localStorage session
            const session = localStorage.getItem(SESSION_KEY);
            if (session) {
                try { setUser(JSON.parse(session)); } catch { localStorage.removeItem(SESSION_KEY); }
            }
            setIsLoading(false);
        }
    }, []);

    // ── Email/password login ──
    const login = async (email: string, password: string) => {
        if (SUPABASE_READY) {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw new Error(error.message);
        } else {
            const users = getStoredUsers();
            const entry = users[email.toLowerCase()];
            if (!entry || entry.password !== password) throw new Error('Invalid email or password.');
            setUser(entry.user);
            localStorage.setItem(SESSION_KEY, JSON.stringify(entry.user));
        }
    };

    // ── Google OAuth login ──
    const loginWithGoogle = async () => {
        if (!SUPABASE_READY) {
            throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local');
        }
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw new Error(error.message);
    };

    // ── Signup ──
    const signup = async (name: string, email: string, password: string) => {
        if (SUPABASE_READY) {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: name } },
            });
            if (error) throw new Error(error.message);
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
        if (SUPABASE_READY) {
            supabase.auth.signOut();
        } else {
            setUser(null);
            localStorage.removeItem(SESSION_KEY);
        }
    };

    // ── updateUser: persist profile data alongside Supabase auth ──
    const updateUser = (updates: Partial<User>) => {
        if (!user) return;
        const updated = { ...user, ...updates };
        setUser(updated);
        if (SUPABASE_READY) {
            // Store profile in localStorage keyed by Supabase user ID
            const profileKey = `linkzy_profile_${user.id}`;
            const current = JSON.parse(localStorage.getItem(profileKey) || '{}');
            localStorage.setItem(profileKey, JSON.stringify({ ...current, ...updates }));
        } else {
            localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
            const users = getStoredUsers();
            if (users[user.email]) {
                users[user.email].user = updated;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, signup, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
