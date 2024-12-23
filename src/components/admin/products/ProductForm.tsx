import React, { useState, useEffect } from 'react';
import { Product, ProductCategory } from '../../../types/product';
import { Store } from '../../../types/store';
import { supabase } from '../../../lib/supabase';
import { generateSlug, ensureUniqueSlug } from '../../../lib/utils';
import { Loader, Image as ImageIcon, X } from 'lucide-react';

interface ProductFormProps {
  stores: Store[];
  categories: ProductCategory[];
  initialProduct?: Partial<Product>;
  onSubmit: (product: Partial<Product>, selectedStores: string[]) => Promise<Product>;
  onCancel: () => void;
}

export function ProductForm({ 
  stores, 
  categories,
  initialProduct,
  onSubmit,
  onCancel 
}: ProductFormProps) {
  const [product, setProduct] = useState<Partial<Product>>(initialProduct || {
    name: '',
    description: '',
    base_price: initialProduct?.base_price || '',
    cost_price: initialProduct?.cost_price || '',
    sku: '',
    category_id: '',
    metadata: {
      attributes: {},
      specifications: {}
    }
  });
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<{ url: string; alt_text?: string }[]>(() => {
    // Initialize with existing images if available
    if (initialProduct?.images?.length) {
      return initialProduct.images.map(img => ({
        url: img.url,
        alt_text: img.alt_text || ''
      }));
    }
    return [];
  });
  
  const [imageError, setImageError] = useState<string | null>(null);
  const [specifications, setSpecifications] = useState<Record<string, string>>(
    initialProduct?.metadata?.specifications || {}
  );
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // Initialize selected stores from existing store associations
  useEffect(() => {
    async function loadStoreAssociations() {
      if (initialProduct?.id) {
        const { data } = await supabase
          .from('store_products')
          .select('store_id')
          .eq('product_id', initialProduct.id);
        
        if (data) {
          setSelectedStores(data.map(sp => sp.store_id));
        }
      }
    }
    loadStoreAssociations();
  }, [initialProduct?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!selectedStores.length) {
      setError('Please select at least one store');
      setLoading(false);
      return;
    }
    
    try {
      // Generate and validate slug
      if (!product.name) {
        throw new Error('Product name is required');
      }

      // Validate prices
      const basePrice = parseFloat(product.base_price as string);
      const costPrice = product.cost_price ? parseFloat(product.cost_price as string) : null;
      
      if (isNaN(basePrice) || basePrice < 0) {
        throw new Error('Please enter a valid base price');
      }
      
      if (costPrice !== null && (isNaN(costPrice) || costPrice < 0)) {
        throw new Error('Please enter a valid cost price');
      }
      
      const baseSlug = generateSlug(product.name);
      const slug = await ensureUniqueSlug(baseSlug, product.id, supabase);
      
      const productWithSlug = {
        ...product,
        slug,
        metadata: { 
          ...product.metadata, 
          specifications,
          images: [] // Don't store images in metadata
        },
        base_price: basePrice,
        cost_price: costPrice,
        updated_at: new Date().toISOString()
      };

      // First, save the product
      const savedProduct = await onSubmit(productWithSlug, selectedStores);
      console.log('Product saved:', savedProduct);
      
      // Then, if we have images, save them to product_images
      if (images.length > 0 && savedProduct?.id) {
        const imageRecords = images.map((img, index) => ({
          product_id: savedProduct.id,
          url: img.url,
          alt_text: img.alt_text || '',
          sort_order: index
        }));
        console.log('Preparing image records:', {
          productId: savedProduct.id,
          imageCount: imageRecords.length,
          records: imageRecords
        });

        // Delete existing images first
        const { error: deleteError } = await supabase
          .from('product_images')
          .delete()
          .eq('product_id', savedProduct.id);

        if (deleteError) {
          console.error('Error deleting existing images:', deleteError);
          throw new Error('Failed to delete existing images');
        }
        console.log('Existing images deleted successfully');
        // Insert new images
        const { data: insertedImages, error: imageError } = await supabase
          .from('product_images')
          .insert(imageRecords)
          .select();

        if (imageError) {
          console.error('Error inserting product images:', imageError);
          throw new Error('Failed to save product images');
        }
        console.log('Images saved successfully:', {
          count: insertedImages?.length || 0,
          images: insertedImages
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleImageAdd = () => {
    const url = window.prompt('Enter image URL (must be https:// or http://)');
    if (!url) return;
    
    // Validate URL
    try {
      new URL(url);
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        throw new Error('URL must start with http:// or https://');
      }
      setImages([...images, { url, alt_text: '' }]);
      setImageError(null);
    } catch (err) {
      setImageError('Please enter a valid URL');
    }
  };

  const handleImageRemove = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAltTextChange = (index: number, alt_text: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], alt_text };
    setImages(newImages);
  };

  const handleAddSpecification = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) return;
    
    setSpecifications(prev => ({
      ...prev,
      [newSpecKey.trim()]: newSpecValue.trim()
    }));
    
    setNewSpecKey('');
    setNewSpecValue('');
  };

  const handleRemoveSpecification = (key: string) => {
    setSpecifications(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            required
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">SKU</label>
          <input
            type="text"
            value={product.sku || ''}
            onChange={(e) => setProduct({ ...product, sku: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Base Price</label>
          <input
            type="number"
            required
            min="0"
            step="any"
            value={product.base_price}
            onChange={(e) => setProduct({ ...product, base_price: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cost Price</label>
          <input
            type="number"
            min="0"
            step="any"
            value={product.cost_price || ''}
            onChange={(e) => setProduct({ ...product, cost_price: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows={3}
            value={product.description || ''}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={product.category_id || ''}
            onChange={(e) => setProduct({ ...product, category_id: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Stores</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {stores.map((store) => (
              <label key={store.id} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={selectedStores.includes(store.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStores([...selectedStores, store.id]);
                    } else {
                      setSelectedStores(selectedStores.filter(id => id !== store.id));
                    }
                  }}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">{store.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      {/* Image Management */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Product Images</h3>
          <button
            type="button"
            onClick={handleImageAdd}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Add Image
          </button>
        </div>

        {imageError && (
          <div className="mb-4 bg-red-50 p-3 rounded-md">
            <p className="text-sm text-red-700">{imageError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <div key={index} className="relative group border rounded-lg p-4">
              <img
                src={image.url}
                alt={image.alt_text || 'Product image'}
                className="w-full h-48 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => handleImageRemove(index)}
                className="absolute top-2 right-2 p-1 bg-red-100 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={image.alt_text || ''}
                onChange={(e) => handleAltTextChange(index, e.target.value)}
                placeholder="Alt text (for accessibility)"
                className="mt-2 w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Specifications Management */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Product Specifications</h3>
        
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Specification Name</label>
            <input
              type="text"
              value={newSpecKey}
              onChange={(e) => setNewSpecKey(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., Material, Size, Weight"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Value</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                className="block w-full rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., Leather, 15 inch, 2.5 kg"
              />
              <button
                type="button"
                onClick={handleAddSpecification}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {Object.keys(specifications).length > 0 && (
          <div className="mt-4 border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(specifications).map(([key, value]) => (
                  <tr key={key}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {key}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {value}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecification(key)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Product'
          )}
        </button>
      </div>
    </form>
  );
}