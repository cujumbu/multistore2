import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check for required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration. Please check your environment variables.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web',
      'X-Client-Version': '2.39.7'
    }
  }
});

// Test connection and handle errors
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    // Add timeout to the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const { error } = await supabase.from('stores').select('id').limit(1);
    clearTimeout(timeoutId);

    if (error) {
      console.error('Supabase connection test failed:', {
        error,
        url: supabaseUrl,
        timestamp: new Date().toISOString()
      });
      return false;
    }
    return true;
  } catch (err: any) {
    // Handle timeout specifically
    if (err.name === 'AbortError') {
      console.error('Supabase connection timeout');
      return false;
    }

    console.error('Failed to connect to Supabase:', {
      error: err,
      url: supabaseUrl,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}