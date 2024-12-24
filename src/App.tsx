import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from './hooks/useAuth';
import AdminLayout from './routes/admin/layout';
import { useStore } from './hooks/useStore';
import { Loader } from 'lucide-react';
import LoginPage from './routes/auth/LoginPage';
import StorefrontLayout from './routes/storefront/StorefrontLayout';
import StoresPage from './routes/admin/stores/StoresPage';
import ProductsPage from './routes/admin/products/ProductsPage';
import SettingsPage from './routes/admin/settings/SettingsPage';

function App() {
  const { store, settings, isLoading } = useStore();
  const { user, isLoading: authLoading } = useAuth();
  const isLoginRoute = window.location.pathname === '/login';

  // Only show loading for non-login routes
  if (!isLoginRoute && (isLoading || authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-indigo-600" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if accessing admin without auth
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  if (isAdminRoute && !user && !authLoading) {
    return <Navigate to="/login" />;
  }

  return (
    <BrowserRouter>
      <Helmet>
        <title>{settings?.seo_settings?.title || 'Tasker'}</title>
        <meta name="description" content={settings?.seo_settings?.description} />
        {settings?.seo_settings?.keywords?.map((keyword, index) => (
          <meta key={index} name="keywords" content={keyword} />
        ))}
      </Helmet>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout currentStore={store} />}>
          <Route index element={<Navigate to="/admin/stores" replace />} />
          <Route path="stores" element={<StoresPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="analytics" element={<div>Analytics Dashboard</div>} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Storefront - catch all other routes */}
        <Route path="*" element={<StorefrontLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
