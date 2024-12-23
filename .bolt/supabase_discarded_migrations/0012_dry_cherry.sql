/*
  # Update product categories schema

  1. Changes
    - Add updated_at column if missing
    - Add indexes for performance
    - Update RLS policies
  
  2. Security
    - Enable RLS
    - Add policies for public viewing and admin management
*/

-- Add updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_categories' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE product_categories 
    ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON product_categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id ON product_categories(parent_id);

-- Enable RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
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
  USING (EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.owner_id = auth.uid()
  ));