import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { items, success_url, cancel_url } = JSON.parse(event.body || '');
    
    if (!items?.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No items provided' })
      };
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'dkk',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : undefined
          },
          unit_amount: Math.round(item.price * 100) // Convert to cents
        },
        quantity: item.quantity
      })),
      mode: 'payment',
      success_url: success_url,
      cancel_url: cancel_url
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id })
    };
  } catch (error) {
    console.error('Checkout error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create checkout session' })
    };
  }
};