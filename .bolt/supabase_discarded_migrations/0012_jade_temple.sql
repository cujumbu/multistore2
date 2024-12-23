/*
  # Fix product management policies and structure

  1. Changes
    - Add product images table
    - Add product variants table
    - Update RLS policies for products management
    - Add policies for store owners to manage their products

  2. Security
    - Enable RLS on all product-related tables
    - Add policies to ensure store owners can only manage their own products
    - Allow public read access to active products
*/

-- Create product images table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create product variants table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  sku text,
  name text NOT NULL,
  price decimal(10,2),
  cost_price decimal(10,2),
  stock_quantity integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Store owners can manage their products" ON products;
DROP POLICY IF EXISTS "Public can view active products" ON products;

-- Create new policies for products table
CREATE POLICY "Store owners can manage their products"
ON products
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM stores
    WHERE owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM stores
    WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Public can view active products"
ON products
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM store_products sp
    WHERE sp.product_id = id
    AND sp.active = true
  )
);

-- Policies for product images
CREATE POLICY "Store owners can manage product images"
ON product_images
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN store_products sp ON sp.product_id = p.id
    JOIN stores s ON s.id = sp.store_id
    WHERE p.id = product_images.product_id
    AND s.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM products p
    JOIN store_products sp ON sp.product_id = p.id
    JOIN stores s ON s.id = sp.store_id
    WHERE p.id = product_images.product_id
    AND s.owner_id = auth.uid()
  )
);

CREATE POLICY "Public can view product images"
ON product_images
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN store_products sp ON sp.product_id = p.id
    WHERE p.id = product_images.product_id
    AND sp.active = true
  )
);

-- Policies for product variants
CREATE POLICY "Store owners can manage product variants"
ON product_variants
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN store_products sp ON sp.product_id = p.id
    JOIN stores s ON s.id = sp.store_id
    WHERE p.id = product_variants.product_id
    AND s.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM products p
    JOIN store_products sp ON sp.product_id = p.id
    JOIN stores s ON s.id = sp.store_id
    WHERE p.id = product_variants.product_id
    AND s.owner_id = auth.uid()
  )
);

CREATE POLICY "Public can view product variants"
ON product_variants
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN store_products sp ON sp.product_id = p.id
    WHERE p.id = product_variants.product_id
    AND sp.active = true
  )
);