/*
  # Add RLS policies for store settings

  1. Security Changes
    - Enable RLS on store_settings table if not already enabled
    - Add policy for store owners to manage their store settings
    - Add policy for public to read active store settings
*/

-- Enable RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Allow store owners to manage their store settings
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

-- Allow public to read store settings
CREATE POLICY "Public can view store settings"
ON store_settings
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = store_settings.store_id 
    AND stores.active = true
  )
);