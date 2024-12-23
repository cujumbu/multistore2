import { StoreProduct } from '../../types/product';
import { useStoreContext } from './StoreProvider';
import { useCartContext } from './CartProvider';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../lib/format';

interface ProductGridProps {
  products: StoreProduct[];
  columns?: 2 | 3 | 4;
}

export function ProductGrid({ products, columns = 3 }: ProductGridProps) {
  const { settings, t } = useStoreContext();
  const { addItem } = useCartContext();
  const navigate = useNavigate();
  const { colors } = settings.theme;

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns} gap-8`}>
      {products.map((storeProduct) => {
        return (
          <div 
            key={storeProduct.id} 
            className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-1 duration-300"
            onClick={() => navigate(`/products/${storeProduct.product?.slug}`)}
          >
            {storeProduct.product?.images?.[0] && (
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-100">
                <img
                  src={storeProduct.product.images[0].url}
                  alt={storeProduct.product.name}
                  className="object-cover object-center w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {storeProduct.product?.name}
              </h3>
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">{storeProduct.product?.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-lg font-medium" style={{ color: colors.primary }}>
                  {formatPrice(
                    storeProduct.price || storeProduct.product?.base_price || 0,
                    settings.locale_settings.locale,
                    settings.locale_settings.currency
                  )}
                </p>
                <button 
                  className="px-4 py-2 rounded-md text-white transition-all transform hover:scale-105 duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (storeProduct.product) {
                      addItem({
                        productId: storeProduct.product.id,
                        storeProductId: storeProduct.id,
                        name: storeProduct.product.name,
                        price: storeProduct.price || storeProduct.product.base_price,
                        quantity: 1,
                        image: storeProduct.product.images?.[0]?.url
                      });
                    }
                  }}
                  style={{ 
                    backgroundColor: colors.primary,
                    '&:hover': { backgroundColor: colors.secondary }
                  }}
                >
                  {t.products.addToCart}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
