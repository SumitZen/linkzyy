import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const isReal = (v?: string) =>
    !!v && v.length > 10 && !v.startsWith('your_') && v !== 'placeholder';

/**
 * `supabase` is null when env vars aren't configured.
 * Callers must check `SUPABASE_READY` before using it.
 */
export const SUPABASE_READY = isReal(supabaseUrl) && isReal(supabaseKey);

// If in production on Vercel, route through the local proxy to bypass ISP blocks (like Jio)
const finalUrl = SUPABASE_READY
    ? (import.meta.env.PROD ? '/api/supabase' : supabaseUrl!)
    : '';

export const supabase: SupabaseClient = SUPABASE_READY
    ? createClient(finalUrl, supabaseKey!)
    : // Typed placeholder — never actually called when SUPABASE_READY is false
    (null as unknown as SupabaseClient);
