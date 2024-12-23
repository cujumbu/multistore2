/*
  # Add new store for skælshampoo.dk

  1. New Store
    - Creates store for skælshampoo.dk (punycode: xn--sklshampoo-e6a.dk)
    - Sets up default store settings
    - Links to existing admin user

  2. Settings
    - Default theme configuration
    - SEO settings
    - Payment settings
    - Shipping settings
*/

DO $$
DECLARE
  v_admin_id uuid;
  v_store_id uuid;
BEGIN
  -- Get admin user ID
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@tasker.dk';
  
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Admin user not found';
  END IF;

  -- Create the store
  INSERT INTO stores (
    name,
    domain,
    description,
    active,
    owner_id
  ) 
  VALUES (
    'Skælshampoo',
    'xn--sklshampoo-e6a.dk',
    'Premium Hair Care Products',
    true,
    v_admin_id
  )
  RETURNING id INTO v_store_id;

  -- Create store settings
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
      "type": "default",
      "colors": {
        "primary": "#4F46E5",
        "secondary": "#10B981",
        "accent": "#F59E0B"
      },
      "typography": {
        "headingFont": "Inter",
        "bodyFont": "Inter"
      },
      "hero": {
        "defaultImage": "https://images.unsplash.com/photo-1522338242992-e1a54906a8da"
      },
      "components": {
        "productCard": {
          "style": "minimal",
          "showQuickView": true
        },
        "navigation": {
          "style": "simple",
          "position": "top"
        }
      }
    }'::jsonb,
    '{
      "title": "Skælshampoo - Premium Hair Care",
      "description": "Discover our premium hair care products",
      "keywords": ["shampoo", "hair care", "scalp care", "premium"]
    }'::jsonb,
    '{
      "providers": ["stripe"],
      "currencies": ["dkk", "eur"]
    }'::jsonb,
    '{
      "zones": [
        {
          "id": "denmark",
          "name": "Denmark",
          "countries": ["DK"],
          "rates": [
            {
              "type": "standard",
              "price": 39
            },
            {
              "type": "express",
              "price": 79
            }
          ]
        },
        {
          "id": "europe",
          "name": "Europe",
          "countries": ["DE", "SE", "NO", "FI"],
          "rates": [
            {
              "type": "standard",
              "price": 89
            }
          ]
        }
      ]
    }'::jsonb
  );
END $$;