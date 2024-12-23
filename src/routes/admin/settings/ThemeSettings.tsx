import { useState } from 'react';
import { useStore } from '../../../hooks/useStore';
import { supabase } from '../../../lib/supabase';
import { themes } from '../../../themes';
import { ThemeType } from '../../../types/theme';
import { Palette } from 'lucide-react';
import { useQueryClient, useMutation } from '@tanstack/react-query';

export function ThemeSettings() {
  const { store, settings } = useStore();
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(
    (settings?.theme?.type as ThemeType) || 'default'
  );
  const [hasChanges, setHasChanges] = useState(false);
  const queryClient = useQueryClient();

  const updateThemeMutation = useMutation({
    mutationFn: async (type: ThemeType) => {
      if (!store?.id) throw new Error('No store selected');
      console.log('Starting theme update:', { type, storeId: store.id });

      const { data: currentSettings, error: fetchError } = await supabase
        .from('store_settings')
        .select('*')
        .eq('store_id', store.id)
        .single();

      if (fetchError) throw fetchError;

      const newTheme = {
        ...currentSettings.theme,
        ...themes[type],
        type,
        updated_at: new Date().toISOString()
      };

      console.log('Updating theme with:', newTheme);

      const { error: updateError } = await supabase
        .from('store_settings')
        .update({
          theme: newTheme,
          updated_at: new Date().toISOString()
        })
        .eq('store_id', store.id);

      if (updateError) throw updateError;

      return type;
    },
    onSuccess: (type) => {
      setSelectedTheme(type);
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ['store'] });
      console.log('Theme update completed:', { type });
    },
    onError: (error) => {
      console.error('Theme update failed:', error);
    }
  });

  const handleThemeSelect = (type: ThemeType) => {
    setSelectedTheme(type);
    setHasChanges(true);
  };

  const handleSave = () => {
    updateThemeMutation.mutate(selectedTheme);
  };

  return (
    <div className="space-y-6">
      {updateThemeMutation.error && (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-sm text-red-700">
            {updateThemeMutation.error instanceof Error 
              ? updateThemeMutation.error.message 
              : 'Failed to update theme'}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Palette className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-semibold text-gray-900">Theme Settings</h2>
        <div className="flex-1" />
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={updateThemeMutation.isPending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {updateThemeMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${
        updateThemeMutation.isPending ? 'opacity-50 pointer-events-none' : ''
      }`}>
        {Object.entries(themes).map(([type, theme]) => (
          <div
            key={type}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedTheme === type
                ? 'ring-2 ring-indigo-600'
                : 'hover:border-indigo-300'
            }`}
            onClick={() => handleThemeSelect(type as ThemeType)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium capitalize">{type}</h3>
              <div className="flex gap-2">
                {Object.values(theme.colors).map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Font: {theme.typography.headingFont}</p>
              <p>Style: {theme.components?.productCard?.style}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}