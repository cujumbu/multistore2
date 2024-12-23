/*
  # Fix Store RLS Policies

  1. Changes
    - Drop existing store policies
    - Add new policies for store management:
      - Allow authenticated users to create stores
      - Allow store owners to manage their stores
      - Allow public to view active stores
    
  2. Security
    - Enable RLS on stores table
    - Add proper policies for CRUD operations
    - Ensure store owners can only manage their own stores
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Store owners can manage their stores" ON stores;
DROP POLICY IF EXISTS "Public can view active stores" ON stores;
DROP POLICY IF EXISTS "Authenticated users can create stores" ON stores;
DROP POLICY IF EXISTS "Store owners can update their stores" ON stores;
DROP POLICY IF EXISTS "Store owners can delete their stores" ON stores;

-- Enable RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create stores
CREATE POLICY "Authenticated users can create stores"
ON stores
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Allow store owners to view their stores
CREATE POLICY "Store owners can view their stores"
ON stores
FOR SELECT
TO authenticated
USING (
  auth.uid() = owner_id
);

-- Allow store owners to update their stores
CREATE POLICY "Store owners can update their stores"
ON stores
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Allow store owners to delete their stores
CREATE POLICY "Store owners can delete their stores"
ON stores
FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

-- Allow public to view active stores
CREATE POLICY "Public can view active stores"
ON stores
FOR SELECT
TO anon, authenticated
USING (active = true);