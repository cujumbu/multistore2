import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { StoreProduct } from '../../types/product';
import { useCartContext } from './CartProvider';
import { useStoreContext } from './StoreProvider';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Loader } from 'lucide-react';
import { formatPrice } from '../../lib/format';

export function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { store, settings, t } = useStoreContext();
  const { addItem } = useCartContext();
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<number>(0);

  useEffect(() => {
    async function loadProduct() {
      try {
        const { data, error } = await supabase
          .from('store_products')
          .select(`
            id,
            store_id,
            product_id,
            price,
            active,
            product:products!inner(
              id,
              name,
              description,
              base_price,
              slug,
              metadata,
              images:product_images(
                id,
                url,
                alt_text,
                sort_order
              )
            ),
            store:stores!inner(id)
          `)
          .eq('store_id', store.id)
          .eq('active', true)
          .eq('products.slug', slug)
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          throw new Error('Product not found');
        }
        setProduct(data);
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [store.id, slug]);

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

  if (error || !product?.product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || t.common.error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.common.back}
        </button>
      </div>
    );
  }

  const { product: productDetails } = product;
  const images = productDetails.images || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>{productDetails.name} | {settings.seo_settings.title}</title>
        <meta 
          name="description" 
          content={productDetails.description || settings.seo_settings.description} 
        />
      </Helmet>
      <button
        onClick={() => navigate(-1)}
        className="mb-8 inline-flex items-center text-indigo-600 hover:text-indigo-500"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t.common.back}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          {images.length > 0 && (
            <>
              <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg">
                <img
                  src={images[selectedImage].url}
                  alt={images[selectedImage].alt_text || productDetails.name}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.map((image, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative aspect-w-1 aspect-h-1 overflow-hidden rounded-lg ${
                        selectedImage === idx ? 'ring-2 ring-indigo-500' : ''
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt_text || `${productDetails.name} view ${idx + 1}`}
                        className="h-full w-full object-cover object-center"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{productDetails.name}</h1>
            <p className="mt-4 text-xl font-medium" style={{ color: settings.theme.colors.primary }}>
              {formatPrice(
                product.price || productDetails.base_price || 0,
                settings.locale_settings.locale,
                settings.locale_settings.currency
              )}
            </p>
          </div>

          <div className="prose prose-sm text-gray-500">
            <p>{productDetails.description}</p>
          </div>
          
          {/* Specifications */}

          {productDetails.metadata?.specifications && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900">{t.products.specifications}</h3>
              <dl className="mt-4 space-y-4">
                {Object.entries(productDetails.metadata.specifications).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">{key}</dt>
                    <dd className="text-sm text-gray-900 col-span-2">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <button
              type="button"
              className="w-full rounded-md py-3 px-8 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
              onClick={() => {
                if (product && productDetails) {
                  addItem({
                    productId: productDetails.id,
                    storeProductId: product.id,
                    name: productDetails.name,
                    price: product.price || productDetails.base_price,
                    quantity: 1,
                    image: images[0]?.url
                  });
                }
              }}
              style={{ 
                backgroundColor: settings.theme.colors.primary,
                '&:hover': { opacity: 0.9 }
              }}
            >
              {t.products.addToCart}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}