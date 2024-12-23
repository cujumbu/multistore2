import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

const checkoutSchema = z.object({
  items: z.array(z.object({
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    image: z.string().optional()
  })),
  success_url: z.string().url(),
  cancel_url: z.string().url()
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
    const data = checkoutSchema.parse(JSON.parse(event.body || ''));
    
    if (!data.items?.length) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No items provided' })
      };
    }

    console.log('Creating checkout session with:', {
      items: data.items,
      success_url: data.success_url,
      cancel_url: data.cancel_url
    });
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['DK', 'SE', 'NO', 'FI', 'DE']
      },
      line_items: data.items.map(item => ({
        price_data: {
          currency: 'dkk',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : []
          },
          unit_amount: Math.round(item.price * 100)
        },
        quantity: item.quantity
      })),
      mode: 'payment',
      customer_creation: 'always',
      payment_intent_data: {
        capture_method: 'automatic'
      },
      success_url: data.success_url,
      cancel_url: data.cancel_url
    });

    console.log('Checkout session created:', {
      sessionId: session.id,
      amount: session.amount_total
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id })
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Checkout error:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage })
    };
  }
};
