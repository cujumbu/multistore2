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
    <div className="relative">
      {imageUrl ? (
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src={imageUrl}
            alt={title}
          />
          <div className="absolute inset-0 bg-gray-900 opacity-40"></div>
        </div>
      ) : null}

      <div className={`relative ${imageUrl ? 'text-white' : 'text-gray-900'} max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8`}>
        <h1 
          className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
          style={{ color: imageUrl ? 'white' : colors.primary }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 text-xl max-w-3xl">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}