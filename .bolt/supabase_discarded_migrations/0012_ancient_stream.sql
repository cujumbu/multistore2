/*
  # Fix theme settings structure

  1. Changes
    - Update store_settings table to ensure theme type is preserved
    - Add default theme settings for tasker.dk store
    - Add check constraint to validate theme type

  2. Security
    - Maintains existing RLS policies
*/

-- First ensure the theme type is properly set for existing records
UPDATE store_settings
SET theme = jsonb_set(
  CASE 
    WHEN theme->>'type' IS NULL THEN 
      jsonb_set(theme, '{type}', '"default"')
    ELSE theme
  END,
  '{type}',
  CASE 
    WHEN theme->>'type' IS NULL THEN '"default"'
    ELSE theme->'type'
  END
);

-- Add check constraint to ensure theme type is always present
ALTER TABLE store_settings
ADD CONSTRAINT valid_theme_type 
CHECK (
  theme ? 'type' AND 
  (theme->>'type' IN ('default', 'bags', 'pyramids'))
);

-- Update tasker.dk store settings with proper theme structure
UPDATE store_settings
SET theme = '{
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
}'::jsonb
WHERE store_id IN (
  SELECT id FROM stores WHERE domain = 'tasker.dk'
);