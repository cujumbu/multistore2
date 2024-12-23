/*
  # Store Products RLS Policies

  1. Security Updates
    - Enable RLS on store_products table
    - Add policies for store owners to manage their store products
    - Add policy for public read access to active products

  2. Changes
    - Add RLS policies for CRUD operations on store_products table
    - Ensure store owners can only manage products for their own stores
*/

-- Enable RLS
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;

-- Store owners can view all products in their stores
CREATE POLICY "Store owners can view their store products"
  ON store_products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = store_products.store_id 
      AND stores.owner_id = auth.uid()
    )
  );

-- Store owners can insert products into their stores
CREATE POLICY "Store owners can add products to their stores"
  ON store_products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = store_products.store_id 
      AND stores.owner_id = auth.uid()
    )
  );

-- Store owners can update products in their stores
CREATE POLICY "Store owners can update their store products"
  ON store_products
  FOR UPDATE
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

-- Store owners can delete products from their stores
CREATE POLICY "Store owners can delete their store products"
  ON store_products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = store_products.store_id 
      AND stores.owner_id = auth.uid()
    )
  );

-- Public can view active products
CREATE POLICY "Public can view active store products"
  ON store_products
  FOR SELECT
  TO anon
  USING (active = true);