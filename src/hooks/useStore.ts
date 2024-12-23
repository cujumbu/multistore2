import { useQuery } from '@tanstack/react-query';
import { supabase, testSupabaseConnection } from '../lib/supabase';
import type { Store, StoreSettings } from '../types/store';
import { isValidDomain } from '../lib/security';

export function useStore() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['store'],
    queryFn: async () => {
      try {
        const isConnected = await testSupabaseConnection();
        if (!isConnected) {
          throw new Error('Unable to connect to the database. Please refresh the page or try again later.');
        }

        const domain = window.location.hostname;
        const isDevelopment = domain.includes('local-credentialless') || 
                           domain.includes('webcontainer') || 
                           domain === 'localhost' ||
                           domain.includes('stackblitz');
        
        const storeDomain = isDevelopment ? 'tasker.dk' : domain;

        if (!isValidDomain(storeDomain)) {
          throw new Error('Invalid domain format');
        }

        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select(`
            id,
            name,
            domain,
            description,
            logo_url,
            active,
            created_at,
            updated_at,
            owner_id,
            store_settings (*)
          `)
          .eq('domain', storeDomain)
          .eq('active', true)
          .maybeSingle();

        if (storeError) throw storeError;
        if (!storeData) throw new Error(`No store found for domain "${storeDomain}" or store is inactive`);

        const { store_settings, ...storeInfo } = storeData;
        return { store: storeInfo, settings: store_settings };
      } catch (err) {
        console.error('Error loading store:', err);
        throw err;
      }
    }
  });

  return {
    store: data?.store ?? null,
    settings: data?.settings ?? null,
    isLoading,
    error: error ? (error as Error).message : null
  };
}