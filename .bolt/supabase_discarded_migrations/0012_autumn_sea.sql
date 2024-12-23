/*
  # Add Stripe settings to store configuration

  1. Changes
    - Add Stripe settings to store_settings table for tasker.dk store
    - Configure Stripe test mode settings
*/

DO $$
DECLARE
  v_store_id uuid;
BEGIN
  -- Get the store ID for tasker.dk
  SELECT id INTO v_store_id FROM stores WHERE domain = 'tasker.dk';
  
  -- Update store settings with Stripe configuration
  UPDATE store_settings
  SET 
    stripe_settings = jsonb_build_object(
      'enabled', true,
      'test_mode', true,
      'publishable_key', 'pk_test_51OpLQtBVxHPj8eVPMvfr5q4YRWHHEDtXjKlLnH9RbIBOyHPqxBXOQZEFDVYWTXwXkhX8JZOIWkICeXZWxGkrNVsC00J9O1zIWt',
      'account_id', 'acct_1OpLQtBVxHPj8eVP'
    ),
    updated_at = now()
  WHERE store_id = v_store_id;
END $$;