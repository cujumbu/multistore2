import { useState, useCallback, useMemo } from 'react';
import { Cart, CartItem } from '../types/cart';
import { v4 as uuidv4 } from 'uuid';

const CART_STORAGE_KEY = 'store_cart';

export function useCart() {
  const [cart, setCart] = useState<Cart>(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : { items: [], total: 0 };
  });

  const saveCart = useCallback((newCart: Cart) => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
    setCart(newCart);
  }, []);

  const calculateTotal = useCallback((items: CartItem[]) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, []);

  const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
    setCart(currentCart => {
      const existingItem = currentCart.items.find(i => i.productId === item.productId);
      
      if (existingItem) {
        const updatedItems = currentCart.items.map(i => 
          i.productId === item.productId 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
        const newCart = { items: updatedItems, total: calculateTotal(updatedItems) };
        saveCart(newCart);
        return newCart;
      }

      const newItem = { ...item, id: uuidv4() };
      const newItems = [...currentCart.items, newItem];
      const newCart = { items: newItems, total: calculateTotal(newItems) };
      saveCart(newCart);
      return newCart;
    });
  }, [calculateTotal, saveCart]);

  const removeItem = useCallback((id: string) => {
    setCart(currentCart => {
      const newItems = currentCart.items.filter(item => item.id !== id);
      const newCart = { items: newItems, total: calculateTotal(newItems) };
      saveCart(newCart);
      return newCart;
    });
  }, [calculateTotal, saveCart]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return;
    
    setCart(currentCart => {
      const newItems = currentCart.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
      const newCart = { items: newItems, total: calculateTotal(newItems) };
      saveCart(newCart);
      return newCart;
    });
  }, [calculateTotal, saveCart]);

  const clearCart = useCallback(() => {
    const emptyCart = { items: [], total: 0 };
    saveCart(emptyCart);
  }, [saveCart]);

  return useMemo(() => ({
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  }), [cart, addItem, removeItem, updateQuantity, clearCart]);
}