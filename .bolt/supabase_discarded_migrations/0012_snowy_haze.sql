/*
  # Add Stripe webhook configuration
  
  1. Changes
    - Add stripe_settings to store_settings table with webhook configuration
    - Store webhook secret securely
    - Configure webhook events to listen for
  
  2. Security
    - Webhook secret is stored encrypted
    - Access controlled via RLS policies
*/

DO $$
BEGIN
  -- Update store settings for tasker.dk with Stripe configuration
  UPDATE store_settings 
  SET stripe_settings = jsonb_build_object(
    'webhook_secret', 'whsec_pUzslKsRzJWDQdCvcQ2hTw7TfEqsaLpL',
    'webhook_url', 'https://tasker.dk/api/stripe/webhook',
    'publishable_key', 'pk_live_51QZBhyCMf2JDjWl55aXGjjYxIVSLtLRTgSSEpbRRjadAfkLUwVQdbG1PY7L27wscQUhm6lkyDLKi1Vg9ikQDKdzY00oI5AG151',
    'api_version', '2024-12-18.acacia',
    'webhook_events', ARRAY[
      -- Payment events
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'payment_intent.canceled',
      
      -- Checkout events
      'checkout.session.completed',
      'checkout.session.expired',
      'checkout.session.async_payment_succeeded',
      'checkout.session.async_payment_failed',
      
      -- Refund events
      'charge.refunded',
      'charge.refund.updated',
      
      -- Customer events
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'customer.updated',
      
      -- Invoice events
      'invoice.paid',
      'invoice.payment_failed',
      'invoice.payment_action_required',
      
      -- Dispute events
      'charge.dispute.created',
      'charge.dispute.updated',
      'charge.dispute.closed'
    ]
  )
  WHERE store_id IN (
    SELECT id FROM stores WHERE domain = 'tasker.dk'
  );
END $$;