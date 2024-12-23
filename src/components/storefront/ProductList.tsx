import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { StoreProduct } from '../../types/product';
import { ProductGrid } from './ProductGrid';
import { Loader } from 'lucide-react';
import { useStoreContext } from './StoreProvider';

interface ProductListProps {
  storeId: string;
}

export function ProductList({ storeId }: ProductListProps) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useStoreContext();

  useEffect(() => {
    async function loadProducts() {
      try {
        const { data, error } = await supabase
          .from('store_products')
          .select(`
            *,
            product:products(
              *,
              images:product_images(*)
            )
          `)
          .eq('store_id', storeId)
          .eq('active', true)
          .order('sort_order');

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [storeId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="mt-2">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{t.common.error}</p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t.products.noProducts}</p>
      </div>
    );
  }

  return <ProductGrid products={products} />;
}