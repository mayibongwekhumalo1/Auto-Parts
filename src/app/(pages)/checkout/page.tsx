'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface CartItem {
  product: {
    _id: string;
    name: string;
  };
  name: string;
  price: number;
  quantity: number;
}

interface Cart {
  items: CartItem[];
  totalAmount: number;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart>({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const router = useRouter();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const cartData = await response.json();
        setCart(cartData);
        if (cartData.items.length === 0) {
          router.push('/cart');
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to continue');
        return;
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ shippingAddress })
      });

      if (response.ok) {
        const { clientSecret } = await response.json();

        // Redirect to Stripe checkout
        const stripe = await stripePromise;
        if (stripe) {
          const { error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: {
                // This would be handled by Stripe Elements in a real implementation
              } as unknown as any,
              billing_details: {
                name: 'Customer Name', // Would get from form
              },
            },
          });

          if (error) {
            alert('Payment failed: ' + error.message);
          } else {
            alert('Payment successful!');
            router.push('/orders');
          }
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading checkout...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cart.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-white">{item.name}</p>
                    <p className="text-zinc-400">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-white">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-700 mt-4 pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-white">Total:</span>
                <span className="text-red-500">${cart.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Payment Form */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Shipping Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                  className="w-full px-3 py-2 border border-zinc-600 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent bg-zinc-800 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                    className="w-full px-3 py-2 border border-zinc-600 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent bg-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                    className="w-full px-3 py-2 border border-zinc-600 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent bg-zinc-800 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                    className="w-full px-3 py-2 border border-zinc-600 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent bg-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                    className="w-full px-3 py-2 border border-zinc-600 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent bg-zinc-800 text-white"
                  />
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-white mb-4">Payment Information</h3>
                <div className="bg-zinc-800 border border-zinc-700 p-4 rounded-md">
                  <p className="text-sm text-zinc-400">
                    Payment processing will be implemented with Stripe Elements in production.
                    For this MVP, payment confirmation is simulated.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-red-700 text-white py-3 px-4 rounded-lg hover:bg-red-600 disabled:bg-zinc-600 disabled:cursor-not-allowed font-medium mt-6 transition-colors"
              >
                {processing ? 'Processing...' : `Pay $${cart.totalAmount.toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}