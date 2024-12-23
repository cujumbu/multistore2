import { useStoreContext } from './StoreProvider';

interface HeroProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

export function Hero({ title, subtitle, imageUrl }: HeroProps) {
  const { settings } = useStoreContext();
  const { colors } = settings.theme;

  return (
    <div className="relative overflow-hidden rounded-xl shadow-2xl">
      {imageUrl ? (
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
            src={imageUrl}
            alt={title}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/60 to-gray-900/80"></div>
        </div>
      ) : null}

      <div className={`relative ${imageUrl ? 'text-white' : 'text-gray-900'} max-w-7xl mx-auto py-32 px-4 sm:py-40 sm:px-6 lg:px-8`}>
        <h1 
          className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl animate-fade-in drop-shadow-lg"
          style={{ color: imageUrl ? 'white' : colors.primary }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-8 text-xl max-w-3xl animate-fade-in-up leading-relaxed drop-shadow">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
