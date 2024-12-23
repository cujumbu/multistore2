import { useStore } from '../../hooks/useStore';
import { ThemeProvider } from '../../components/storefront/ThemeProvider';
import { StoreProvider } from '../../components/storefront/StoreProvider';
import { Navigation } from '../../components/storefront/Navigation';
import { Hero } from '../../components/storefront/Hero';
import { ProductList } from '../../components/storefront/ProductList';
import { ProductDetails } from '../../components/storefront/ProductDetails';
import { Routes, Route } from 'react-router-dom';
import { getThemeByDomain } from '../../themes';
import { CartProvider } from '../../components/storefront/CartProvider';

const navigationItems = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' }
];

export default function StorefrontLayout() {
  const { store, settings, isLoading, error } = useStore();
  const theme = getThemeByDomain(window.location.hostname);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !store || !settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md p-4 bg-red-50 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Store Loading Error</h2>
          <p className="text-red-600">{error || 'Failed to load store data'}</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="mt-2 text-sm text-gray-600">
              Tip: Make sure the store exists in the database and is active
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <StoreProvider store={store} settings={settings}>
      <ThemeProvider theme={theme}>
        <CartProvider>
          <div className="min-h-screen">
            <Navigation items={navigationItems} />
          <main>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/" element={
                  <>
                    <Hero
                      title={settings.seo_settings.title || store.name}
                      subtitle={settings.seo_settings.description}
                      imageUrl={theme.hero?.defaultImage}
                    />
                    <div className="mt-12">
                      <ProductList storeId={store.id} />
                    </div>
                  </>
                } />
                <Route path="/products/:slug" element={<ProductDetails />} />
              </Routes>
            </div>
          </main>
        </div>
        </CartProvider>
      </ThemeProvider>
    </StoreProvider>
  );
}