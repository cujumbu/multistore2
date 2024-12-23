import { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { verifyStoreAccess } from '../../lib/security';
import { Settings, Store, Package, BarChart3, Users } from 'lucide-react';
import type { Store as StoreType } from '../../types/store';

interface AdminLayoutProps {
  currentStore: StoreType | null;
}

const AdminLayout = ({ currentStore }: AdminLayoutProps) => {
  const { user, isLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [accessChecking, setAccessChecking] = useState(false);
  const location = useLocation();

  // Don't show loading if we're already at login
  const isLoginPage = location.pathname === '/login';
  const isAdminRoute = location.pathname.startsWith('/admin');

  const isActivePath = (path: string) => location.pathname === path;

  useEffect(() => {
    async function checkAccess() {
      setAccessChecking(true);

      // If no user, deny access immediately
      if (!user) {
        setHasAccess(false);
        setAccessChecking(false);
        return;
      }

      // If we're not on an admin route, no need to check access
      if (!isAdminRoute) {
        setHasAccess(true);
        setAccessChecking(false);
        return;
      }

      // For admin routes, verify store access if we have a store
      if (currentStore) {
        console.log('Checking store access for:', {
          storeId: currentStore.id,
          userId: user.id
        });
        const hasStoreAccess = await verifyStoreAccess(currentStore.id, user.id);
        setHasAccess(hasStoreAccess);
      } else {
        // User is logged in but no store selected - allow access to admin
        console.log('No store selected, granting admin access');
        setHasAccess(true);
      }
      setAccessChecking(false);
    }

    checkAccess();
  }, [currentStore, user, isAdminRoute]);

  // Handle loading state
  if (!isLoginPage && (isLoading || accessChecking)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle authentication and access control
  if (!isLoginPage && (!user || hasAccess === false)) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 border-b space-y-2">
          <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
          {currentStore && (
            <p className="text-sm text-gray-600">
              Current Store: {currentStore.name}
            </p>
          )}
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/admin/stores"
                className={`flex items-center p-2 rounded transition-colors ${
                  isActivePath('/admin/stores')
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Store className="w-5 h-5 mr-3" />
                Stores
              </Link>
            </li>
            <li>
              <Link
                to="/admin/products"
                className={`flex items-center p-2 rounded transition-colors ${
                  isActivePath('/admin/products')
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Package className="w-5 h-5 mr-3" />
                Products
              </Link>
            </li>
            <li>
              <Link
                to="/admin/analytics"
                className={`flex items-center p-2 rounded transition-colors ${
                  isActivePath('/admin/analytics')
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                Analytics
              </Link>
            </li>
            <li>
              <Link
                to="/admin/settings"
                className={`flex items-center p-2 rounded transition-colors ${
                  isActivePath('/admin/settings')
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;