/*
  # Add product cost tracking and improve product management

  1. Changes
    - Add cost_price to products table
    - Add product_categories table for better organization
    - Add product_images table for multiple images per product
    - Add product_variants table for SKU variations

  2. Security
    - Enable RLS on new tables
    - Add policies for store owners
*/

-- Add cost_price to products
ALTER TABLE products
ADD COLUMN cost_price decimal(10,2);

-- Create product categories
CREATE TABLE product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  parent_id uuid REFERENCES product_categories(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product images table
CREATE TABLE product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create product variants
CREATE TABLE product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  sku text UNIQUE,
  name text NOT NULL,
  price decimal(10,2),
  cost_price decimal(10,2),
  stock_quantity integer DEFAULT 0,
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
  USING (true)
  WITH CHECK (true);

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
  USING (EXISTS (
    SELECT 1 FROM products p
    JOIN store_products sp ON sp.product_id = p.id
    JOIN stores s ON s.id = sp.store_id
    WHERE p.id = product_images.product_id
    AND s.owner_id = auth.uid()
  ));

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
  USING (EXISTS (
    SELECT 1 FROM products p
    JOIN store_products sp ON sp.product_id = p.id
    JOIN stores s ON s.id = sp.store_id
    WHERE p.id = product_variants.product_id
    AND s.owner_id = auth.uid()
  ));