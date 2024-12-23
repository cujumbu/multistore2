/*
  # Fix Product Schema and Policies

  1. Changes
    - Rename category_id to product_category_id in products table
    - Add proper foreign key constraint
    - Update RLS policies for store_products table
    - Add policies for product_images table

  2. Security
    - Enable RLS on product_images
    - Add policies for store owners to manage their product images
*/

-- Rename category_id to product_category_id and add proper foreign key
ALTER TABLE products 
  RENAME COLUMN category_id TO product_category_id;

ALTER TABLE products
  ADD CONSTRAINT fk_product_category
  FOREIGN KEY (product_category_id)
  REFERENCES product_categories(id)
  ON DELETE SET NULL;

-- Create product_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Store owners can manage their products" ON store_products;
DROP POLICY IF EXISTS "Store owners can manage product images" ON product_images;

-- Create new policies

-- Store Products policies
CREATE POLICY "Store owners can manage their products"
ON store_products
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = store_products.store_id 
    AND stores.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = store_products.store_id 
    AND stores.owner_id = auth.uid()
  )
);

-- Product Images policies
CREATE POLICY "Store owners can manage product images"
ON product_images
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM products
    JOIN store_products ON store_products.product_id = products.id
    JOIN stores ON stores.id = store_products.store_id
    WHERE product_images.product_id = products.id
    AND stores.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM products
    JOIN store_products ON store_products.product_id = products.id
    JOIN stores ON stores.id = store_products.store_id
    WHERE product_images.product_id = products.id
    AND stores.owner_id = auth.uid()
  )
);