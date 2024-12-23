/*
  # Add Stripe webhook configuration

  1. Changes
    - Add stripe_settings to store_settings table
    - Add webhook_events table for tracking processed events
    - Add webhook_secret to store settings
    - Add policies for webhook event handling

  2. Security
    - Enable RLS on webhook_events table
    - Add policy for store owners to view their webhook events
*/

-- Add webhook_events table
CREATE TABLE webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id),
  event_id text NOT NULL,
  event_type text NOT NULL,
  event_data jsonb NOT NULL,
  processed_at timestamptz DEFAULT now(),
  status text DEFAULT 'processed',
  UNIQUE(event_id)
);

-- Enable RLS
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Add policy for store owners to view their webhook events
CREATE POLICY "Store owners can view their webhook events"
  ON webhook_events
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = webhook_events.store_id 
    AND stores.owner_id = auth.uid()
  ));

-- Update store_settings to include Stripe configuration
DO $$
DECLARE
  v_store_id uuid;
BEGIN
  -- Get the store ID for tasker.dk
  SELECT id INTO v_store_id FROM stores WHERE domain = 'tasker.dk';
  
  -- Update store settings with Stripe configuration
  UPDATE store_settings
  SET stripe_settings = jsonb_build_object(
    'publishable_key', 'pk_test_your_key',
    'webhook_secret', 'whsec_pUzslKsRzJWDQdCvcQ2hTw7TfEqsaLpL',
    'webhook_url', 'https://tasker.dk/api/stripe/webhook',
    'supported_events', ARRAY[
      'checkout.session.completed',
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.paid',
      'invoice.payment_failed'
    ]
  )
  WHERE store_id = v_store_id;
END $$;