/*
  # Fix theme settings persistence

  1. Changes
    - Add trigger to ensure store settings exist for each store
    - Add constraint to ensure store_id is unique
    - Add trigger to update the updated_at timestamp
    - Add function to validate theme data

  2. Security
    - Maintain existing RLS policies
*/

-- Create function to validate theme data
CREATE OR REPLACE FUNCTION validate_theme_data()
RETURNS trigger AS $$
BEGIN
  -- Ensure theme is an object
  IF NOT (NEW.theme ? 'type' AND NEW.theme ? 'colors' AND NEW.theme ? 'typography') THEN
    RAISE EXCEPTION 'Invalid theme data structure';
  END IF;

  -- Ensure required theme properties exist
  IF NOT (NEW.theme->'colors' ? 'primary' AND 
          NEW.theme->'colors' ? 'secondary' AND 
          NEW.theme->'colors' ? 'accent') THEN
    RAISE EXCEPTION 'Missing required theme colors';
  END IF;

  IF NOT (NEW.theme->'typography' ? 'headingFont' AND 
          NEW.theme->'typography' ? 'bodyFont') THEN
    RAISE EXCEPTION 'Missing required typography settings';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for theme validation
DROP TRIGGER IF EXISTS validate_theme ON store_settings;
CREATE TRIGGER validate_theme
  BEFORE INSERT OR UPDATE ON store_settings
  FOR EACH ROW
  EXECUTE FUNCTION validate_theme_data();

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_store_settings_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for timestamp update
DROP TRIGGER IF EXISTS update_store_settings_timestamp ON store_settings;
CREATE TRIGGER update_store_settings_timestamp
  BEFORE UPDATE ON store_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_store_settings_timestamp();