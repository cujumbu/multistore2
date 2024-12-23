/*
  # Add tasker.dk store

  1. Changes
    - Insert new store record for tasker.dk
    - Add default store settings

  2. Security
    - Uses existing RLS policies
    - Only store owner can manage the store
*/

-- Insert the store
INSERT INTO stores (
  name,
  domain,
  description,
  active
) VALUES (
  'Tasker',
  'tasker.dk',
  'Task Management Platform',
  true
);

-- Get the store ID
DO $$
DECLARE
  store_id uuid;
BEGIN
  SELECT id INTO store_id FROM stores WHERE domain = 'tasker.dk';
  
  -- Insert default store settings
  INSERT INTO store_settings (
    store_id,
    theme,
    seo_settings,
    payment_settings,
    shipping_settings
  ) VALUES (
    store_id,
    '{
      "colors": {
        "primary": "#4F46E5",
        "secondary": "#10B981",
        "accent": "#F59E0B"
      },
      "typography": {
        "headingFont": "Inter",
        "bodyFont": "Inter"
      }
    }'::jsonb,
    '{
      "title": "Tasker - Task Management Platform",
      "description": "Efficient task management solution",
      "keywords": ["task management", "productivity", "organization"]
    }'::jsonb,
    '{
      "providers": ["stripe"],
      "currencies": ["dkk", "eur"]
    }'::jsonb,
    '{
      "zones": [
        {
          "id": "europe",
          "name": "Europe",
          "countries": ["DK", "DE", "SE", "NO"],
          "rates": [
            {
              "type": "standard",
              "price": 0
            }
          ]
        }
      ]
    }'::jsonb
  );
END $$;