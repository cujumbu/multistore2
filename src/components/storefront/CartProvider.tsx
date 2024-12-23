import { createContext, useContext, ReactNode } from 'react';
import { CartContextType } from '../../types/cart';
import { useCart } from '../../hooks/useCart';

const CartContext = createContext<CartContextType | null>(null);

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const cart = useCart();
  
  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  );
}