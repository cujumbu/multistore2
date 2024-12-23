/*
  # Fix product categories relationship

  1. Changes
    - Rename categories table to product_categories
    - Update foreign key in products table
    - Add RLS policies for product categories

  2. Security
    - Enable RLS on product_categories table
    - Add policies for public viewing and authenticated management
*/

-- First, drop the existing foreign key if it exists
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_category_id_fkey;

-- Rename categories table to product_categories if it hasn't been renamed yet
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'categories'
  ) THEN
    ALTER TABLE categories RENAME TO product_categories;
  END IF;
END $$;

-- Update the foreign key to point to product_categories
ALTER TABLE products
ADD CONSTRAINT products_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES product_categories(id)
ON DELETE SET NULL;

-- Enable RLS on product_categories if not already enabled
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view product categories" ON product_categories;
DROP POLICY IF EXISTS "Store owners can manage product categories" ON product_categories;

-- Create policies
CREATE POLICY "Public can view product categories"
  ON product_categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Store owners can manage product categories"
  ON product_categories
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM stores WHERE stores.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM stores WHERE stores.owner_id = auth.uid()));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON product_categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id ON product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);