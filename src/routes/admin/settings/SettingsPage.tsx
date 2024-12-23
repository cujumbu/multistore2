import { ThemeSettings } from './ThemeSettings';
import { LocaleSettings } from './LocaleSettings';
import { SeoSettings } from '../../../components/admin/settings/SeoSettings';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Settings className="w-8 h-8 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <ThemeSettings />
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <LocaleSettings />
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <SeoSettings />
      </div>
    </div>
  );
}