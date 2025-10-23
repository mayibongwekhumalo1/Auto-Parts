'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
  };
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Cart {
  items: CartItem[];
  totalAmount: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart>({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
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
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity })
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/cart?productId=${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const proceedToCheckout = () => {
    if (cart.items.length === 0) {
      alert('Your cart is empty');
      return;
    }
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading cart...</div>
      </div>
    );
  }

  const token = localStorage.getItem('token');
  if (!token) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please Login</h1>
          <p className="text-zinc-400 mb-8">You need to be logged in to view your cart</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-red-700 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>

        {cart.items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400 text-lg mb-4">Your cart is empty</p>
            <button
              onClick={() => router.push('/')}
              className="bg-red-700 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl">
            <div className="divide-y divide-zinc-700">
              {cart.items.map((item, index) => (
                <div key={index} className="p-6 flex items-center">
                  <div className="flex-shrink-0 w-20 h-20 bg-zinc-800 rounded-lg flex items-center justify-center mr-4">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-zinc-500 text-sm">No Image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white">{item.name}</h3>
                    <p className="text-zinc-400">${item.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-3 py-1 border border-zinc-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-white hover:bg-zinc-700 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 border border-zinc-600 rounded-md text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                      className="px-3 py-1 border border-zinc-600 rounded-md text-white hover:bg-zinc-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="ml-4 text-lg font-medium text-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button
                    onClick={() => removeItem(item.product._id)}
                    className="ml-4 text-red-600 hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="p-6 bg-zinc-800 border-t border-zinc-700">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-white">Total:</span>
                <span className="text-2xl font-bold text-red-500">${cart.totalAmount.toFixed(2)}</span>
              </div>
              <button
                onClick={proceedToCheckout}
                className="w-full bg-red-700 text-white py-3 px-4 rounded-lg hover:bg-red-600 font-medium transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}