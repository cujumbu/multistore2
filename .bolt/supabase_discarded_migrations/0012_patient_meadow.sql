/*
  # Add RLS policies for store settings

  1. Changes
    - Enable RLS on store_settings table
    - Add policies for store owners to manage their store settings
    - Add policy for public read access to store settings
    
  2. Security
    - Store owners can manage their store's settings
    - Public can read store settings for active stores
*/

-- Enable RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Store owners can manage their store settings
CREATE POLICY "Store owners can manage their store settings"
ON store_settings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = store_settings.store_id
    AND stores.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = store_settings.store_id
    AND stores.owner_id = auth.uid()
  )
);

-- Public can view store settings
CREATE POLICY "Public can view store settings"
ON store_settings
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = store_settings.store_id
    AND stores.active = true
  )
);