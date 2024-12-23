/*
  # Fix store access and domain handling

  1. Changes
    - Update store owner to nethandelskompagniet@gmail.com
    - Ensure store exists for both domains (localhost and tasker.dk)
    - Update store settings for both domains
    - Add RLS policies for public store access
*/

DO $$
DECLARE
  v_admin_id uuid;
  v_store_id uuid;
BEGIN
  -- Get admin user ID
  SELECT id INTO v_admin_id 
  FROM auth.users 
  WHERE email = 'nethandelskompagniet@gmail.com';
  
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Admin user not found';
  END IF;

  -- Create or update store for tasker.dk
  INSERT INTO stores (
    name,
    domain,
    description,
    active,
    owner_id
  ) 
  VALUES (
    'Tasker',
    'tasker.dk',
    'Premium Bags & Accessories',
    true,
    v_admin_id
  )
  ON CONFLICT (domain) 
  DO UPDATE SET 
    active = true,
    owner_id = v_admin_id
  RETURNING id INTO v_store_id;

  -- Create or update store settings for tasker.dk
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

  -- Create or update store for localhost
  INSERT INTO stores (
    name,
    domain,
    description,
    active,
    owner_id
  ) 
  VALUES (
    'Tasker',
    'localhost',
    'Premium Bags & Accessories',
    true,
    v_admin_id
  )
  ON CONFLICT (domain) 
  DO UPDATE SET 
    active = true,
    owner_id = v_admin_id;

  -- Update RLS policies
  DROP POLICY IF EXISTS "Public can view active stores" ON stores;
  CREATE POLICY "Public can view active stores"
    ON stores
    FOR SELECT
    TO public
    USING (active = true);

  DROP POLICY IF EXISTS "Public can view store settings" ON store_settings;
  CREATE POLICY "Public can view store settings"
    ON store_settings
    FOR SELECT
    TO public
    USING (
      EXISTS (
        SELECT 1 FROM stores 
        WHERE stores.id = store_settings.store_id 
        AND stores.active = true
      )
    );
END $$;