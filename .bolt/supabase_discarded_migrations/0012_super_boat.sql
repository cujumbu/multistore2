/*
  # Fix product slug handling

  1. Changes
    - Make product slug field optional
    - Add function to generate slugs from product names
    - Add trigger to auto-generate slugs when missing

  2. Security
    - No changes to RLS policies
*/

-- Make slug field optional
ALTER TABLE products ALTER COLUMN slug DROP NOT NULL;

-- Create function to generate slugs
CREATE OR REPLACE FUNCTION generate_product_slug(product_name text)
RETURNS text AS $$
DECLARE
  base_slug text;
  new_slug text;
  counter integer := 0;
BEGIN
  -- Convert to lowercase and replace spaces/special chars with hyphens
  base_slug := lower(regexp_replace(product_name, '[^a-zA-Z0-9]+', '-', 'g'));
  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  
  -- Start with base slug
  new_slug := base_slug;
  
  -- Keep trying until we find a unique slug
  WHILE EXISTS (SELECT 1 FROM products WHERE slug = new_slug) LOOP
    counter := counter + 1;
    new_slug := base_slug || '-' || counter::text;
  END LOOP;
  
  RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate slugs
CREATE OR REPLACE FUNCTION auto_generate_product_slug()
RETURNS trigger AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_product_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to products table
DROP TRIGGER IF EXISTS ensure_product_slug ON products;
CREATE TRIGGER ensure_product_slug
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_product_slug();