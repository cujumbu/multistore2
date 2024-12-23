import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartContext } from './CartProvider';
import { CartDrawer } from './CartDrawer';
import { useStoreContext } from './StoreProvider';

export function CartButton() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart } = useCartContext();
  const { settings } = useStoreContext();

  return (
    <>
      <button
        onClick={() => setIsCartOpen(true)}
        className="relative p-2 text-gray-400 hover:text-gray-500"
      >
        <ShoppingCart className="h-6 w-6" />
        {cart.items.length > 0 && (
          <span
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs flex items-center justify-center text-white"
            style={{ backgroundColor: settings.theme.colors.primary }}
          >
            {cart.items.length}
          </span>
        )}
      </button>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}