import { createClient } from '@supabase/supabase-js';

// Configuration: Credentials loaded strictly from environment variables
const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL)
  ? import.meta.env.VITE_SUPABASE_URL
  : (typeof window !== 'undefined' && window.VITE_SUPABASE_URL ? window.VITE_SUPABASE_URL : '');

const SUPABASE_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY)
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : (typeof window !== 'undefined' && window.VITE_SUPABASE_ANON_KEY ? window.VITE_SUPABASE_ANON_KEY : '');

let client = null;

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    const supabaseSDK = (typeof createClient !== 'undefined') 
      ? createClient 
      : (typeof window !== 'undefined' && window.supabase ? window.supabase.createClient : null);

    if (supabaseSDK) {
      client = supabaseSDK(SUPABASE_URL, SUPABASE_KEY);
    } else {
      client = createClient(SUPABASE_URL, SUPABASE_KEY);
    }
  } catch (err) {
    console.warn("Supabase Client Initialization Warning:", err);
  }
}

/**
 * Singleton instance provider for Supabase Client
 */
export const getSupabaseClient = () => client;
export const isSupabaseConfigured = () => !!client;
