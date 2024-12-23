/*
  # Store Settings Constraints and Indexes

  1. Changes
    - Add foreign key constraint for store_id
    - Add index on store_id for faster lookups
    - Add trigger to ensure each store has settings
*/

-- Add foreign key constraint if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'store_settings_store_id_fkey'
  ) THEN
    ALTER TABLE store_settings
    ADD CONSTRAINT store_settings_store_id_fkey
    FOREIGN KEY (store_id) REFERENCES stores(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_store_settings_store_id ON store_settings(store_id);

-- Create function to ensure store settings exist
CREATE OR REPLACE FUNCTION ensure_store_settings()
RETURNS trigger AS $$
BEGIN
  INSERT INTO store_settings (store_id, theme, updated_at)
  VALUES (
    NEW.id,
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
      }
    }'::jsonb,
    NOW()
  )
  ON CONFLICT (store_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create store settings
DROP TRIGGER IF EXISTS create_store_settings ON stores;
CREATE TRIGGER create_store_settings
  AFTER INSERT ON stores
  FOR EACH ROW
  EXECUTE FUNCTION ensure_store_settings();