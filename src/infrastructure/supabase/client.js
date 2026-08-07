import { createClient } from '@supabase/supabase-js';

// Configuration: Replace with your Supabase credentials when ready
const SUPABASE_URL = "";
const SUPABASE_KEY = "";

let client = null;

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    client = createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (err) {
    console.warn("Supabase Client Initialization Warning:", err);
  }
}

/**
 * Singleton instance provider for Supabase Client
 */
export const getSupabaseClient = () => client;
export const isSupabaseConfigured = () => !!client;
