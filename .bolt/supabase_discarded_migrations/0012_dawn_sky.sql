/*
  # Fix Store RLS Policies

  1. Changes
    - Drop existing RLS policies for stores table
    - Create new comprehensive policies that allow:
      - Store creation by authenticated users
      - Store management by owners
      - Public viewing of active stores
      
  2. Security
    - Enable RLS on stores table
    - Ensure proper owner_id checks
    - Maintain data isolation between store owners
*/

-- First, drop existing policies to start fresh
DROP POLICY IF EXISTS "Store owners can manage their stores" ON stores;
DROP POLICY IF EXISTS "Public can view active stores" ON stores;
DROP POLICY IF EXISTS "Authenticated users can create stores" ON stores;
DROP POLICY IF EXISTS "Store owners can update their stores" ON stores;
DROP POLICY IF EXISTS "Store owners can delete their stores" ON stores;
DROP POLICY IF EXISTS "Store owners can view their stores" ON stores;

-- Enable RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create stores
CREATE POLICY "Authenticated users can create stores"
ON stores
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow creation with the authenticated user as owner
  auth.uid() = owner_id
);

-- Allow store owners to view their stores
CREATE POLICY "Store owners can view their stores"
ON stores
FOR SELECT
TO authenticated
USING (
  -- Store owners can see their stores
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
USING (
  -- Anyone can view active stores
  active = true
);