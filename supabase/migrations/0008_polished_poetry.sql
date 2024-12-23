/*
  # Update store settings

  1. Changes
    - Ensures store settings exist for tasker.dk store
    - Updates theme configuration with proper structure
    - Adds default settings if missing

  2. Security
    - Maintains existing RLS policies
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

  -- Insert or update store settings
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
      "type": "bags",
      "colors": {
        "primary": "#8B4513",
        "secondary": "#D2691E",
        "accent": "#F4A460"
      },
      "typography": {
        "headingFont": "Playfair Display",
        "bodyFont": "Lato"
      },
      "hero": {
        "defaultImage": "https://images.unsplash.com/photo-1547949003-9792a18a2601"
      },
      "components": {
        "productCard": {
          "style": "elegant",
          "showQuickView": true
        },
        "navigation": {
          "style": "detailed",
          "position": "top"
        }
      }
    }'::jsonb,
    '{
      "title": "Tasker - Premium Bags & Accessories",
      "description": "Discover our curated collection of premium bags and accessories",
      "keywords": ["bags", "accessories", "leather goods", "premium"]
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
  ON CONFLICT (store_id) 
  DO UPDATE SET
    theme = EXCLUDED.theme,
    seo_settings = EXCLUDED.seo_settings,
    updated_at = now();
END $$;