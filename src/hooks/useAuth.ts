import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { testSupabaseConnection } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initAuth() {
      try {
        // Test connection first
        const isConnected = await testSupabaseConnection();
        if (!isConnected) {
          setError('Unable to connect to authentication service');
          setIsLoading(false);
          return;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Failed to get authentication session');
          setIsLoading(false);
          return;
        }

        setUser(session?.user ?? null);
        setError(null);
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Authentication service unavailable');
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setError(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, isLoading, error };
}