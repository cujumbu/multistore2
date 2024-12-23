import { useState } from 'react';
import { useStore } from '../../../hooks/useStore';
import { supabase } from '../../../lib/supabase';
import { Search } from 'lucide-react';

export function SeoSettings() {
  const { store, settings } = useStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seoSettings, setSeoSettings] = useState({
    title: settings?.seo_settings?.title || '',
    description: settings?.seo_settings?.description || '',
    keywords: settings?.seo_settings?.keywords || []
  });

  const handleSave = async () => {
    if (!store) return;
    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('store_settings')
        .update({
          seo_settings: seoSettings,
          updated_at: new Date().toISOString()
        })
        .eq('store_id', store.id);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error updating SEO settings:', err);
      setError('Failed to update SEO settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Search className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-semibold text-gray-900">SEO Settings</h2>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Default Meta Title
          </label>
          <input
            type="text"
            value={seoSettings.title}
            onChange={(e) => setSeoSettings({ ...seoSettings, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Your Store Name - Tagline"
          />
          <p className="mt-1 text-sm text-gray-500">
            This will be used as the default page title for your store
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Default Meta Description
          </label>
          <textarea
            value={seoSettings.description}
            onChange={(e) => setSeoSettings({ ...seoSettings, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="A brief description of your store (150-160 characters recommended)"
          />
          <p className="mt-1 text-sm text-gray-500">
            This description appears in search engine results
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Keywords
          </label>
          <input
            type="text"
            value={seoSettings.keywords.join(', ')}
            onChange={(e) => setSeoSettings({
              ...seoSettings,
              keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="keyword1, keyword2, keyword3"
          />
          <p className="mt-1 text-sm text-gray-500">
            Separate keywords with commas
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}