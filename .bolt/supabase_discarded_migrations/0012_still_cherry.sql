/*
  # Add locale settings

  1. Changes
    - Add locale_settings to store_settings table
    - Set default locale settings for existing stores
*/

-- First, add default locale settings to existing store settings
UPDATE store_settings
SET locale_settings = jsonb_build_object(
  'locale', 'da-DK',
  'currency', 'DKK',
  'numberFormat', jsonb_build_object(
    'decimal', ',',
    'thousand', '.',
    'precision', 2
  ),
  'dateFormat', 'DD/MM/YYYY'
)
WHERE locale_settings IS NULL;