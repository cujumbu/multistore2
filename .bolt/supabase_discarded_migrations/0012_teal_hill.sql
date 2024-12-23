/*
  # Add locale settings to store settings

  1. Changes
    - Add default locale settings to store_settings table
    - Update existing store settings with default locale configuration
*/

-- Update existing store settings with default locale settings
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