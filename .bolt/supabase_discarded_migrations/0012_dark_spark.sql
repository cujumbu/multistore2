/*
  # Add product management policies

  1. Changes
    - Add RLS policies for products table to allow store owners to manage products
    - Add policies for product images and variants
    - Add policies for store products association

  2. Security
    - Enable RLS on all product-related tables
    - Add policies to ensure store owners can only manage their own products
    - Allow public read access to active products
*/

-- Enable RLS on product-related tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Store owners can manage products that are associated with their stores
CREATE POLICY "Store owners can manage their products"
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

-- Public can view products that are active in any store
CREATE POLICY "Public can view active products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM store_products
      WHERE product_id = products.id
      AND active = true
    )
  );

-- Store owners can manage product images
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

-- Public can view product images
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

-- Store owners can manage product variants
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

-- Public can view product variants
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