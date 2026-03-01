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

export const supabase: SupabaseClient = SUPABASE_READY
    ? createClient(supabaseUrl!, supabaseKey!)
    : // Typed placeholder — never actually called when SUPABASE_READY is false
    (null as unknown as SupabaseClient);
