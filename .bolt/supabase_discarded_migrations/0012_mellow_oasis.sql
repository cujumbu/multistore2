/*
  # Add product images support

  1. New Tables
    - `product_images`
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products)
      - `url` (text)
      - `alt_text` (text, nullable)
      - `sort_order` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on product_images table
    - Add policy for store owners to manage their product images
    - Add policy for public to view product images
*/

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Create policies
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