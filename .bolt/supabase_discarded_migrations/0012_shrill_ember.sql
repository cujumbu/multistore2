/*
  # Fix theme persistence

  1. Changes
    - Add default theme settings to store_settings
    - Ensure theme type is properly stored
    - Add locale settings structure

  2. Data Updates
    - Update existing store settings with proper theme structure
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

  -- Update store settings with proper theme structure
  INSERT INTO store_settings (
    store_id,
    theme,
    seo_settings,
    payment_settings,
    shipping_settings,
    locale_settings
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
    }'::jsonb,
    '{
      "locale": "da-DK",
      "currency": "DKK",
      "numberFormat": {
        "decimal": ",",
        "thousand": ".",
        "precision": 2
      },
      "dateFormat": "DD/MM/YYYY"
    }'::jsonb
  )
  ON CONFLICT (store_id) 
  DO UPDATE SET
    theme = EXCLUDED.theme,
    locale_settings = EXCLUDED.locale_settings,
    updated_at = now();
END $$;