import { useStore } from '../../hooks/useStore';
import { Helmet } from 'react-helmet-async';
import { ThemeProvider } from '../../components/storefront/ThemeProvider';

return (
  <StoreProvider store={store} settings={settings}>
    <ThemeProvider theme={theme}>
      <Helmet>
        <title>{settings.seo_settings.title}</title>
        <meta name="description" content={settings.seo_settings.description} />
        {settings.seo_settings.keywords?.length > 0 && (
          <meta name="keywords" content={settings.seo_settings.keywords.join(', ')} />
        )}
      </Helmet>
      <CartProvider>
        <div className="min-h-screen">
          <Navigation items={navigationItems} />