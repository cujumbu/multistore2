import { useState } from 'react';
import { useStore } from '../../../hooks/useStore';
import { supabase } from '../../../lib/supabase';
import { Globe } from 'lucide-react';

const SUPPORTED_LOCALES = [
  { code: 'da-DK', name: 'Danish (Denmark)' },
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' }
];

const SUPPORTED_CURRENCIES = [
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' }
];

export function LocaleSettings() {
  const { store, settings } = useStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Default locale settings if none exist
  const localeSettings = settings?.locale_settings || {
    locale: 'da-DK',
    currency: 'DKK',
    numberFormat: {
      decimal: ',',
      thousand: '.',
      precision: 2
    },
    dateFormat: 'DD/MM/YYYY'
  };

  const handleLocaleChange = async (locale: string) => {
    if (!store) return;
    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('store_settings')
        .update({
          locale_settings: {
            ...settings.locale_settings,
            locale
          }
        })
        .eq('store_id', store.id);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error updating locale:', err);
      setError('Failed to update locale settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCurrencyChange = async (currency: string) => {
    if (!store) return;
    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('store_settings')
        .update({
          locale_settings: {
            ...settings.locale_settings,
            currency
          }
        })
        .eq('store_id', store.id);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error updating currency:', err);
      setError('Failed to update currency settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Globe className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-semibold text-gray-900">Locale Settings</h2>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Store Language</label>
          <select
            value={localeSettings.locale}
            onChange={(e) => handleLocaleChange(e.target.value)}
            disabled={saving}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {SUPPORTED_LOCALES.map((locale) => (
              <option key={locale.code} value={locale.code}>
                {locale.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-gray-500">
            This will affect the language of your storefront
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Store Currency</label>
          <select
            value={localeSettings.currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            disabled={saving}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {SUPPORTED_CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.name} ({currency.symbol})
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-gray-500">
            This will affect how prices are displayed in your store
          </p>
        </div>
      </div>
    </div>
  );
}