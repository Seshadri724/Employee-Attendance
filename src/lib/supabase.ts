// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate credentials before creating client
const isSupabaseConfigured = Boolean(
    SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    SUPABASE_ANON_KEY !== 'your-anon-key-here'
);

// Create client only if configured, otherwise create a mock that warns on use
export const supabase: SupabaseClient | null = isSupabaseConfigured
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

export const isSupabaseEnabled = isSupabaseConfigured;

// Helper to safely use Supabase
export function getSupabaseClient(): SupabaseClient {
    if (!supabase) {
        throw new Error(
            'Supabase is not configured. Please add valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
        );
    }
    return supabase;
}
