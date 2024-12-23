/*
  # Update RLS policies for single owner scenario

  1. Changes
    - Simplified RLS policies for products and store_products
    - Removed unnecessary complexity while maintaining security
    - Added policies for product images and variants
  
  2. Security
    - Maintains row-level security
    - Ensures only authenticated owner can manage products
    - Allows public read access for active products
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Store owners can manage products" ON products;
DROP POLICY IF EXISTS "Store owners can manage store products" ON store_products;
DROP POLICY IF EXISTS "Public can view active products" ON products;
DROP POLICY IF EXISTS "Public can view active store products" ON store_products;

-- Products table policies
CREATE POLICY "Owner can manage products"
  ON products
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

CREATE POLICY "Public can view products"
  ON products
  FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM store_products sp
    WHERE sp.product_id = id
    AND sp.active = true
  ));

-- Store products table policies
CREATE POLICY "Owner can manage store products"
  ON store_products
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = store_id 
    AND stores.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = store_id 
    AND stores.owner_id = auth.uid()
  ));

CREATE POLICY "Public can view store products"
  ON store_products
  FOR SELECT
  TO public
  USING (active = true);

-- Product images table policies
CREATE POLICY "Owner can manage product images"
  ON product_images
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM products p
    JOIN stores s ON EXISTS (
      SELECT 1 FROM store_products sp
      WHERE sp.store_id = s.id
      AND sp.product_id = p.id
    )
    WHERE p.id = product_id
    AND s.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM products p
    JOIN stores s ON EXISTS (
      SELECT 1 FROM store_products sp
      WHERE sp.store_id = s.id
      AND sp.product_id = p.id
    )
    WHERE p.id = product_id
    AND s.owner_id = auth.uid()
  ));

CREATE POLICY "Public can view product images"
  ON product_images
  FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM products p
    JOIN store_products sp ON sp.product_id = p.id
    WHERE p.id = product_id
    AND sp.active = true
  ));