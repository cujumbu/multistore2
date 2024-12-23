/*
  # Add payment settings

  1. Changes
    - Add stripe_settings to store_settings table
    - Add payment_methods table
    - Add payment_transactions table
    - Add RLS policies
*/

-- Add stripe_settings to store_settings
ALTER TABLE store_settings
ADD COLUMN IF NOT EXISTS stripe_settings jsonb DEFAULT jsonb_build_object(
  'publishable_key', '',
  'webhook_secret', '',
  'payment_methods', ARRAY['card']::text[]
);

-- Create payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) NOT NULL,
  type text NOT NULL,
  name text NOT NULL,
  active boolean DEFAULT true,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) NOT NULL,
  order_id uuid REFERENCES orders(id) NOT NULL,
  amount decimal(10,2) NOT NULL,
  currency text NOT NULL,
  status text NOT NULL,
  payment_method text NOT NULL,
  stripe_payment_intent_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Store owners can manage payment methods"
  ON payment_methods
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = payment_methods.store_id 
    AND stores.owner_id = auth.uid()
  ));

CREATE POLICY "Store owners can view transactions"
  ON payment_transactions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = payment_transactions.store_id 
    AND stores.owner_id = auth.uid()
  ));