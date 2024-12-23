/*
  # Add Tasker store and settings

  1. Changes
    - Add store record for tasker.dk domain
    - Set up default store settings with theme and configuration
*/

-- Insert the store if it doesn't exist
INSERT INTO stores (
  name,
  domain,
  description,
  active,
  owner_id
) 
SELECT
  'Tasker',
  'tasker.dk',
  'Task Management Platform',
  true,
  (SELECT id FROM auth.users WHERE email = 'admin@tasker.dk')
WHERE NOT EXISTS (
  SELECT 1 FROM stores WHERE domain = 'tasker.dk'
);

-- Insert store settings
DO $$
DECLARE
  v_store_id uuid;
BEGIN
  SELECT id INTO v_store_id FROM stores WHERE domain = 'tasker.dk';
  
  INSERT INTO store_settings (
    store_id,
    theme,
    seo_settings,
    payment_settings,
    shipping_settings
  ) 
  VALUES (
    v_store_id,
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
  )
  ON CONFLICT (store_id) DO NOTHING;
END $$;