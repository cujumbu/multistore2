import { Leaf, TreePine, Wind } from 'lucide-react';

interface SustainabilityBannerProps {
  storeName: string;e
}

export function SustainabilityBanner({ storeName }: SustainabilityBannerProps) {
  return (
    <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 py-4 border-y border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-center sm:text-left">
          <div className="flex items-center gap-3 group">
            <Leaf className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
            <span className="text-sm text-gray-700">
              {storeName} bidrager med 0,5% af hvert køb til CO₂-reduktion
            </span>
          </div>
          <div className="flex items-center gap-3 group">
            <TreePine className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
            <span className="text-sm text-gray-700">
              Bæredygtig emballage
            </span>
          </div>
          <div className="flex items-center gap-3 group">
            <Wind className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
            <span className="text-sm text-gray-700">
              Klimavenlig levering
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
