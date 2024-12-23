/*
  # Add product images support

  1. New Tables
    - `product_images`
      - `id` (uuid, primary key)
      - `product_id` (uuid, references products)
      - `url` (text)
      - `alt_text` (text)
      - `sort_order` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `product_images` table
    - Add policy for public read access
    - Add policy for store owners to manage images
*/

-- Create product_images table
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

-- Create policies
CREATE POLICY "Anyone can view product images"
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
      SELECT 1 
      FROM products p
      JOIN store_products sp ON sp.product_id = p.id
      JOIN stores s ON s.id = sp.store_id
      WHERE product_images.product_id = p.id
      AND s.owner_id = auth.uid()
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_sort_order ON product_images(sort_order);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_product_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_images_timestamp
  BEFORE UPDATE ON product_images
  FOR EACH ROW
  EXECUTE FUNCTION update_product_images_updated_at();