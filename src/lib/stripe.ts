import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

// Cache stripe instance per store
const stripeInstances: Record<string, Promise<Stripe | null>> = {};

export async function getStripe(storeId: string): Promise<Stripe | null> {
  if (!stripeInstances[storeId]) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error('No Stripe publishable key found for store');
      return null;
    }
    stripeInstances[storeId] = loadStripe(publishableKey);
  }
  return stripeInstances[storeId];
}
