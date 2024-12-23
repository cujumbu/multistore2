/*
  # Multi-storefront Ecommerce Schema

  1. New Tables
    - `stores`
      - Core store configuration and settings
    - `products`
      - Unified product catalog
    - `categories`
      - Product categorization system
    - `store_products`
      - Store-specific product mappings and pricing
    - `orders`
      - Order management across stores
    - `order_items`
      - Individual items in orders
    - `inventory`
      - Cross-store inventory tracking
    - `store_settings`
      - Store-specific configurations (themes, SEO, etc)
    - `analytics`
      - Store performance metrics

  2. Security
    - Enable RLS on all tables
    - Policies for store owners and admins
    - Secure data access patterns
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stores table
CREATE TABLE stores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  domain text UNIQUE,
  description text,
  logo_url text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  owner_id uuid REFERENCES auth.users(id)
);

-- Categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  parent_id uuid REFERENCES categories(id),
  created_at timestamptz DEFAULT now()
);

-- Products table (unified catalog)
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  base_price decimal(10,2) NOT NULL,
  sku text UNIQUE,
  category_id uuid REFERENCES categories(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(slug)
);

-- Store-specific product settings
CREATE TABLE store_products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid REFERENCES stores(id),
  product_id uuid REFERENCES products(id),
  price decimal(10,2),
  active boolean DEFAULT true,
  featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(store_id, product_id)
);

-- Inventory tracking
CREATE TABLE inventory (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid REFERENCES products(id),
  store_id uuid REFERENCES stores(id),
  quantity integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, store_id)
);

-- Orders
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid REFERENCES stores(id),
  user_id uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending',
  total_amount decimal(10,2) NOT NULL,
  shipping_address jsonb NOT NULL,
  billing_address jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id),
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Store settings
CREATE TABLE store_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid REFERENCES stores(id) UNIQUE,
  theme jsonb DEFAULT '{}'::jsonb,
  seo_settings jsonb DEFAULT '{}'::jsonb,
  payment_settings jsonb DEFAULT '{}'::jsonb,
  shipping_settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Analytics
CREATE TABLE analytics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid REFERENCES stores(id),
  date date NOT NULL,
  visits integer DEFAULT 0,
  sales decimal(10,2) DEFAULT 0,
  orders_count integer DEFAULT 0,
  metrics jsonb DEFAULT '{}'::jsonb,
  UNIQUE(store_id, date)
);

-- Enable Row Level Security
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Policies

-- Store owners can manage their stores
CREATE POLICY "Store owners can manage their stores"
  ON stores
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Public can view active store products
CREATE POLICY "Public can view active store products"
  ON store_products
  FOR SELECT
  TO anon
  USING (active = true);

-- Store owners can manage their products
CREATE POLICY "Store owners can manage their products"
  ON store_products
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = store_products.store_id 
    AND stores.owner_id = auth.uid()
  ));

-- Store owners can view their orders
CREATE POLICY "Store owners can view their orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = orders.store_id 
    AND stores.owner_id = auth.uid()
  ));

-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create functions for analytics
CREATE OR REPLACE FUNCTION update_store_analytics()
RETURNS trigger AS $$
BEGIN
  INSERT INTO analytics (store_id, date, orders_count, sales)
  VALUES (
    NEW.store_id,
    CURRENT_DATE,
    1,
    NEW.total_amount
  )
  ON CONFLICT (store_id, date)
  DO UPDATE SET
    orders_count = analytics.orders_count + 1,
    sales = analytics.sales + NEW.total_amount;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for analytics
CREATE TRIGGER update_analytics_on_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_store_analytics();