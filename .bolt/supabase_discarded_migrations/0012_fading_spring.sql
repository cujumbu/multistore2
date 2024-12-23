/*
  # Fix product slug and add policies

  1. Changes
    - Add trigger for auto-generating product slugs
    - Add function to generate unique slugs
    - Add policies for product management
    - Add product images table and policies

  2. Security
    - Enable RLS on product_images table
    - Add policies for managing product images
    - Update product access policies
*/

-- Create product_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on product_images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Create function to generate slugs
CREATE OR REPLACE FUNCTION generate_product_slug(product_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
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
$$;

-- Create trigger function for auto-generating slugs
CREATE OR REPLACE FUNCTION auto_generate_product_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_product_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$;

-- Add trigger to products table
DROP TRIGGER IF EXISTS ensure_product_slug ON products;
CREATE TRIGGER ensure_product_slug
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_product_slug();

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Store owners can manage products" ON products;
DROP POLICY IF EXISTS "Public can view active products" ON products;
DROP POLICY IF EXISTS "Store owners can manage product images" ON product_images;

-- Create policies for products
CREATE POLICY "Store owners can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM store_products sp
      JOIN stores s ON s.id = sp.store_id
      WHERE sp.product_id = products.id
      AND s.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM store_products sp
      JOIN stores s ON s.id = sp.store_id
      WHERE sp.product_id = products.id
      AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY "Public can view active products"
  ON products
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 
      FROM store_products sp
      WHERE sp.product_id = products.id
      AND sp.active = true
    )
  );

-- Create policies for product images
CREATE POLICY "Store owners can manage product images"
  ON product_images
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM products p
      JOIN store_products sp ON sp.product_id = p.id
      JOIN stores s ON s.id = sp.store_id
      WHERE p.id = product_images.product_id
      AND s.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM products p
      JOIN store_products sp ON sp.product_id = p.id
      JOIN stores s ON s.id = sp.store_id
      WHERE p.id = product_images.product_id
      AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY "Public can view product images"
  ON product_images
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 
      FROM products p
      JOIN store_products sp ON sp.product_id = p.id
      WHERE p.id = product_images.product_id
      AND sp.active = true
    )
  );