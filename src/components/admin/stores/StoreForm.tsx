import React, { useState } from 'react';
import { Store, StoreSettings } from '../../../types/store';
import { supabase } from '../../../lib/supabase';
import { Loader } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

interface StoreFormProps {
  store?: Store;
  onSubmit: () => void;
  onCancel: () => void;
}

export function StoreForm({ store, onSubmit, onCancel }: StoreFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<Store>>({
    name: store?.name || '',
    domain: store?.domain || '',
    description: store?.description || '',
    logo_url: store?.logo_url || '',
    active: store?.active ?? true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!user?.id) {
      setError('You must be logged in to create a store');
      setLoading(false);
      return;
    }

    try {      
      // Prepare store data with owner_id
      const storeData = {
        id: store?.id,
        ...formData,
        owner_id: user.id,
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('stores')
        .upsert(storeData);
      if (updateError) throw updateError;
      // If this is a new store, create default settings
      if (!store?.id) {
        // Get the newly created store
        const { data: newStore } = await supabase
          .from('stores')
          .select('id, store_settings!inner(*)')
          .eq('domain', formData.domain)
          .maybeSingle();

        if (newStore && !newStore.store_settings) {
          const defaultSettings: Partial<StoreSettings> = {
            store_id: newStore.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            theme: {
              type: 'default',
              colors: {
                primary: '#4F46E5',
                secondary: '#10B981',
                accent: '#F59E0B'
              },
              typography: {
                headingFont: 'Inter',
                bodyFont: 'Inter'
              }
            },
            seo_settings: {
              title: formData.name,
              description: formData.description || '',
              keywords: []
            },
            payment_settings: {
              providers: ['stripe'],
              currencies: ['dkk', 'eur']
            }
          };

          const { error: settingsError } = await supabase
            .from('store_settings')
            .upsert(defaultSettings);

          if (settingsError) throw settingsError;
        }
      }

      onSubmit();
    } catch (err) {
      console.error('Error saving store:', err);
      setError('Failed to save store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Store Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Domain</label>
          <input
            type="text"
            required
            value={formData.domain}
            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Logo URL</label>
          <input
            type="url"
            value={formData.logo_url || ''}
            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">Active</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Store'
          )}
        </button>
      </div>
    </form>
  );
}