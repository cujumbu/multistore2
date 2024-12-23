/*
  # Add Product Management

  1. New Tables
    - `product_categories`
      - Basic category management for products
      - Hierarchical structure with parent_id
    
    - `product_images`
      - Store multiple images per product
      - Support for alt text and sorting
    
    - `product_variants`
      - Variant support (size, color, etc)
      - Individual pricing and stock tracking
    
  2. Updates to Existing Tables
    - Add cost_price to products table
    - Add metadata fields for attributes and specifications
    
  3. Security
    - Enable RLS on all new tables
    - Add policies for store owners
*/

-- Create product categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  parent_id uuid REFERENCES product_categories(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add cost_price to products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'cost_price'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN cost_price decimal(10,2);
  END IF;
END $$;

-- Create product images table
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create product variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  sku text,
  name text NOT NULL,
  price decimal(10,2),
  cost_price decimal(10,2),
  stock_quantity integer NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Policies for product categories
CREATE POLICY "Public can view product categories"
  ON product_categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Store owners can manage product categories"
  ON product_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.owner_id = auth.uid()
    )
  );

-- Policies for product images
CREATE POLICY "Public can view product images"
  ON product_images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Store owners can manage product images"
  ON product_images
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores 
      JOIN store_products ON stores.id = store_products.store_id
      WHERE stores.owner_id = auth.uid()
      AND store_products.product_id = product_images.product_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores 
      JOIN store_products ON stores.id = store_products.store_id
      WHERE stores.owner_id = auth.uid()
      AND store_products.product_id = product_images.product_id
    )
  );

-- Policies for product variants
CREATE POLICY "Public can view product variants"
  ON product_variants
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Store owners can manage product variants"
  ON product_variants
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores 
      JOIN store_products ON stores.id = store_products.store_id
      WHERE stores.owner_id = auth.uid()
      AND store_products.product_id = product_variants.product_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores 
      JOIN store_products ON stores.id = store_products.store_id
      WHERE stores.owner_id = auth.uid()
      AND store_products.product_id = product_variants.product_id
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON product_categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);