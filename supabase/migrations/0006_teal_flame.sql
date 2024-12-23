-- Update store owner for tasker.dk
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get the user ID for the admin
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'nethandelskompagniet@gmail.com';
  
  -- Update the store owner
  UPDATE stores 
  SET owner_id = v_user_id
  WHERE domain = 'tasker.dk';
END $$;