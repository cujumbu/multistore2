import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Cache stripe instance per store
const stripeInstances: Record<string, Promise<Stripe | null>> = {};

export async function getStripe(storeId: string): Promise<Stripe | null> {
  if (!stripeInstances[storeId]) {
    // Get the store's Stripe publishable key
    const { data: settings, error } = await supabase
      .from('store_settings')
      .select('payment_settings')
      .eq('store_id', storeId)
      .single();

    if (error) {
      console.error('Error fetching Stripe settings:', error);
      return null;
    }
    
    const publishableKey = settings?.payment_settings?.stripe_publishable_key;
    if (!publishableKey) {
      console.error('No Stripe publishable key found for store');
      return null;
    }

    stripeInstances[storeId] = loadStripe(publishableKey);
  }

  return stripeInstances[storeId];
}
