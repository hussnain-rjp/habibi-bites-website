import { createClient } from '@supabase/supabase-js';

// Configuration: Credentials configured for Habibi Bites project
const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL)
  ? import.meta.env.VITE_SUPABASE_URL
  : "https://wgsssibktygkwyicdtlr.supabase.co";

const SUPABASE_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY)
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indnc3NzaWJrdHlna3d5aWNkdGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMjEwNDYsImV4cCI6MjEwMTY5NzA0Nn0.EYAek-TmMZ_oE1t9jRdcZjlfcNC3e77rTPMGh0jgFRo";

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
