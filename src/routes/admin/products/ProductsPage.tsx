import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Product, ProductCategory } from '../../../types/product';
import { Store } from '../../../types/store';
import { PlusCircle, Loader, Trash2 } from 'lucide-react';
import { ProductForm } from '../../../components/admin/products/ProductForm';
import { DeleteConfirmationModal } from '../../../components/admin/DeleteConfirmationModal';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    Promise.all([
      loadProducts(),
      loadStores(),
      loadCategories()
    ]).finally(() => setLoading(false));
  }, []);

  async function loadProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(*),
          images:product_images(*),
          variants:product_variants(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error:', err);
    }
  }

  async function loadStores() {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name');

      if (error) throw error;
      setStores(data || []);
    } catch (err) {
      console.error('Error loading stores:', err);
    }
  }

  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }

  const handleSubmit = async (productData: Partial<Product>, selectedStores: string[]) => {
    try {
      // Insert or update product
      const { data: savedProduct, error: productError } = await supabase
        .from('products')
        .upsert({
          id: selectedProduct?.id,
          name: productData.name,
          description: productData.description,
          base_price: productData.base_price,
          cost_price: productData.cost_price,
          sku: productData.sku,
          category_id: productData.category_id,
          metadata: productData.metadata,
          slug: productData.slug,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (productError) throw productError;

      if (!savedProduct) {
        throw new Error('Failed to save product - no data returned');
      }

      // Update store associations
      if (savedProduct) {
        // First delete existing store associations
        const { error: deleteError } = await supabase
          .from('store_products')
          .delete()
          .eq('product_id', savedProduct.id);

        if (deleteError) throw deleteError;

        // Then create new store associations
        const storeProducts = selectedStores.map(storeId => ({
          store_id: storeId,
          product_id: savedProduct.id,
          active: true
        }));

        const { error: storeError } = await supabase
          .from('store_products')
          .insert(storeProducts);

        if (storeError) throw storeError;
      }

      await loadProducts();
      setShowForm(false);
      setSelectedProduct(null);
      return savedProduct;
    } catch (err) {
      console.error('Error saving product:', err);
      throw new Error('Failed to save product');
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    try {
      // First delete product images
      const { error: imagesError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productToDelete.id);

      if (imagesError) throw imagesError;

      // Delete store product associations
      const { error: storeProductsError } = await supabase
        .from('store_products')
        .delete()
        .eq('product_id', productToDelete.id);

      if (storeProductsError) throw storeProductsError;

      // Finally delete the product
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id);

      if (deleteError) throw deleteError;

      await loadProducts();
      setProductToDelete(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button 
          onClick={() => {
            setSelectedProduct(null);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          New Product
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {selectedProduct ? 'Edit Product' : 'New Product'}
          </h2>
          <ProductForm
            stores={stores}
            categories={categories}
            initialProduct={selectedProduct || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedProduct(null);
            }}
          />
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedProduct(product);
                setShowForm(true);
              }}
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                {product.images?.[0] && (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="object-cover w-full h-48"
                  />
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  {product.category && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {product.category.name}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-gray-900">
                      ${product.base_price}
                    </div>
                    {product.cost_price && (
                      <div className="text-sm text-gray-500">
                        Cost: ${product.cost_price}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">SKU: {product.sku}</span>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setProductToDelete(product);
                  }}
                  className="p-2 text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <DeleteConfirmationModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}