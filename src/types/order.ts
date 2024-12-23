export interface Order {
  id: string;
  store_id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total_amount: number;
  shipping_address: {
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
  billing_address: {
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  metadata: {
    product_name: string;
    product_sku: string;
    variant?: string;
  };
}