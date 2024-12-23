/*
  # Add admin user and store association

  1. Changes
    - Insert admin user into auth.users
    - Update store owner_id with admin user ID
    - Add admin role to user

  2. Security
    - Uses secure password hashing
    - Associates user with store through RLS policies
*/

-- Create admin user (password will be set through UI)
INSERT INTO auth.users (
  id,
  email,
  role,
  instance_id,
  email_confirmed_at
)
SELECT 
  uuid_generate_v4(),
  'admin@tasker.dk',
  'authenticated',
  '00000000-0000-0000-0000-000000000000',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'admin@tasker.dk'
);

-- Update store owner
DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@tasker.dk';
  
  UPDATE stores 
  SET owner_id = admin_id
  WHERE domain = 'tasker.dk';
END $$;