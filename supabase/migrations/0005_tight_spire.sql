/*
  # Add store owner permissions

  1. Changes
    - Updates the store owner to the provided email address
    - Ensures the user has correct permissions
*/

-- Update store owner for tasker.dk
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get the user ID for the admin
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'your-email@example.com';  -- Replace with your actual email
  
  -- Update the store owner
  UPDATE stores 
  SET owner_id = v_user_id
  WHERE domain = 'tasker.dk';
END $$;