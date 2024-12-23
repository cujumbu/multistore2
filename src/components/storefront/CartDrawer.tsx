import { useState } from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCartContext } from './CartProvider';
import { useStoreContext } from './StoreProvider';
import { getStripe } from '../../lib/stripe';
import { formatPrice } from '../../lib/format';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeItem, updateQuantity } = useCartContext();
  const { store, settings, t } = useStoreContext();
  const { locale_settings: { locale, currency } } = settings;
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const stripe = await getStripe(store.id);
      if (!stripe) throw new Error('Failed to initialize Stripe');

      // Create a Checkout Session
      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.items,
          success_url: `${window.location.origin}/checkout/success`,
          cancel_url: `${window.location.origin}/checkout/cancel`,
        }),
      });

      const session = await response.json();

      // Redirect to Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw result.error;
      }
    } catch (error) {
      console.error('Error in checkout:', error);
      // Handle error (show error message to user)
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl">
              <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    {t.cart.title}
                  </h2>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-8">
                  {cart.items.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      {t.cart.empty}
                    </p>
                  ) : (
                    <div className="flow-root">
                      <ul className="divide-y divide-gray-200">
                        {cart.items.map((item) => (
                          <li key={item.id} className="py-6 flex">
                            {item.image && (
                              <div className="flex-shrink-0 w-24 h-24 border rounded-md overflow-hidden">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-center object-cover"
                                />
                              </div>
                            )}
                            <div className="ml-4 flex-1 flex flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3>{item.name}</h3>
                                  <p className="ml-4">
                                    {formatPrice(item.price * item.quantity, locale, currency)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex-1 flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="p-1 rounded-full hover:bg-gray-100"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="font-medium">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="p-1 rounded-full hover:bg-gray-100"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.id)}
                                  className="font-medium text-red-600 hover:text-red-500"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {cart.items.length > 0 && (
                <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>{t.cart.total}</p>
                    <p>{formatPrice(cart.total, locale, currency)}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {t.cart.shippingNote}
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={handleCheckout}
                      disabled={checkoutLoading}
                      className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white"
                      style={{ backgroundColor: settings.theme.colors.primary }}
                    >
                      {checkoutLoading ? 'Processing...' : t.cart.checkout}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}