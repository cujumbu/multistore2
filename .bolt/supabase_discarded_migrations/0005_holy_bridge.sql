/*
  # Set up admin user password
  
  1. Changes
    - Sets password for admin@tasker.dk user
    - Password will be: Admin123!
    
  Note: In production, you should change this password immediately after first login
*/

-- Set password for admin user (password hash for 'Admin123!')
UPDATE auth.users 
SET 
  encrypted_password = '$2a$10$5J5Xk7zXZKKU1Wp2OPuYGOpYJ8Ap8WhRze8hkPJ/HDhDyYxIwpd/e',
  email_confirmed_at = now(),
  confirmation_sent_at = now(),
  is_sso_user = false,
  updated_at = now()
WHERE email = 'admin@tasker.dk';