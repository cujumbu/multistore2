/*
  # Update Product and Store Product Policies

  1. Changes
    - Add policies for products table to allow store owners to manage products
    - Add policies for store_products table to allow store owners to manage their store products
    - Add policies for public access to active products

  2. Security
    - Enable RLS on products and store_products tables
    - Add policies for authenticated users who own the associated stores
    - Add policies for public viewing of active products
*/

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Store owners can manage products" ON products;
DROP POLICY IF EXISTS "Store owners can manage store products" ON store_products;
DROP POLICY IF EXISTS "Public can view active products" ON products;
DROP POLICY IF EXISTS "Public can view active store products" ON store_products;

-- Products policies
CREATE POLICY "Store owners can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM store_products sp
      JOIN stores s ON s.id = sp.store_id
      WHERE sp.product_id = products.id
      AND s.owner_id = auth.uid()
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
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM store_products
      WHERE product_id = products.id
      AND active = true
    )
  );

-- Store products policies
CREATE POLICY "Store owners can manage store products"
  ON store_products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE id = store_products.store_id
      AND owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE id = store_products.store_id
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Public can view active store products"
  ON store_products
  FOR SELECT
  TO public
  USING (active = true);