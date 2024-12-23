/*
  # Add locale settings to store_settings

  1. Changes
    - Update store_settings for tasker.dk to include locale_settings
    - Set default locale settings for Danish language and currency
*/

DO $$
DECLARE
  v_store_id uuid;
BEGIN
  -- Get the store ID for tasker.dk
  SELECT id INTO v_store_id FROM stores WHERE domain = 'tasker.dk';
  
  IF v_store_id IS NULL THEN
    RAISE EXCEPTION 'Store tasker.dk not found';
  END IF;

  -- Update store settings with locale settings
  UPDATE store_settings
  SET 
    theme = COALESCE(theme, '{}'::jsonb),
    locale_settings = '{
      "locale": "da-DK",
      "currency": "DKK",
      "numberFormat": {
        "decimal": ",",
        "thousand": ".",
        "precision": 2
      },
      "dateFormat": "DD/MM/YYYY"
    }'::jsonb,
    updated_at = now()
  WHERE store_id = v_store_id;

END $$;