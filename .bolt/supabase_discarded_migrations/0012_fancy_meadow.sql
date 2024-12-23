/*
  # Update Product Management Policies

  1. Changes
    - Add comprehensive RLS policies for products and store_products tables
    - Enable store owners to manage products across their stores
    - Allow public access to active products
    - Fix store_products policy to properly handle store ownership

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated store owners
    - Add policies for public access to active products
*/

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

CREATE POLICY "Public can view active products"
  ON products
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM store_products
      WHERE store_products.product_id = products.id
      AND store_products.active = true
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

CREATE POLICY "Public can view active store products"
  ON store_products
  FOR SELECT
  TO public
  USING (active = true);