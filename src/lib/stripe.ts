import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

let stripePromise: Promise<Stripe | null>;

export async function getStripe(storeId: string): Promise<Stripe | null> {
  if (!stripePromise) {
    // Get the store's Stripe publishable key
    const { data: settings } = await supabase
      .from('store_settings')
      .select('stripe_settings')
      .eq('store_id', storeId)
      .single();

    const publishableKey = settings?.stripe_settings?.live_publishable_key;
    if (!publishableKey) {
      console.error('No Stripe publishable key found for store');
      return null;
    }

    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}
