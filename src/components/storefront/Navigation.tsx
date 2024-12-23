import { useStoreContext } from './StoreProvider';
import { CartButton } from './CartButton';

interface NavigationItem {
  label: string;
  href: string;
}

interface NavigationProps {
  items: NavigationItem[];
}

export function Navigation({ items }: NavigationProps) {
  const { store, settings, t } = useStoreContext();
  const { colors } = settings.theme;

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ borderColor: colors.primary }}>
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {store.logo_url ? (
                <img
                  className="h-8 w-auto"
                  src={store.logo_url}
                  alt={store.name}
                />
              ) : (
                <span className="text-2xl font-bold" style={{ color: colors.primary }}>
                  {store.name}
                </span>
              )}
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:opacity-75 transition-opacity"
                >
                  {t.navigation[item.label.toLowerCase() as keyof typeof t.navigation]}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <CartButton />
          </div>
        </div>
      </nav>
    </header>
  );
}