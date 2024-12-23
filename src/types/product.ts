export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  cost_price: number | null;
  sku: string | null;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  metadata: {
    attributes?: Record<string, string>;
    specifications?: Record<string, string>;
  };
  images?: ProductImage[];
  variants?: ProductVariant[];
  category?: ProductCategory;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string | null;
  name: string;
  price: number | null;
  cost_price: number | null;
  stock_quantity: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoreProduct {
  id: string;
  store_id: string;
  product_id: string;
  price: number | null;
  active: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
  product?: Product;
}