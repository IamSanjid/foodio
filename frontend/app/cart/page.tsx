'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Loader2,
  CheckCircle2,
  ShoppingCart,
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function Cart() {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();
  const { user } = useAuth();
  const { placeOrder, loading } = useOrders();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const orderItems = items.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
      }));
      await placeOrder(orderItems);
      setOrderSuccess(true);
      clearCart();
    } catch {
      alert('Failed to place order. Please try again.');
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FF5C00]/5">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[3.5rem] premium-shadow text-center max-w-lg"
        >
          <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-black mb-4">Order Placed!</h2>
          <p className="text-gray-500 text-lg mb-10">
            Thank you for choosing Foodio. Your order is being prepared and will
            be with you shortly.
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => router.push('/orders')}
              className="btn-primary py-4 text-lg"
            >
              Track My Order
            </button>
            <button
              onClick={() => router.push('/')}
              className="text-[#FF5C00] font-bold"
            >
              Back to Menu
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="grow max-w-7xl mx-auto w-full px-6 py-12">
        <h1 className="text-4xl font-black mb-10">Your Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] premium-shadow">
            <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2">Cart is empty</h2>
            <p className="text-gray-500 mb-8">
              Add something delicious from our menu.
            </p>
            <button onClick={() => router.push('/')} className="btn-primary">
              Check Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white p-6 rounded-3xl premium-shadow flex items-center gap-6"
                  >
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-sm">
                      <Image
                        src={
                          item.image ||
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'
                        }
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="grow">
                      <h3 className="text-lg font-bold mb-1">{item.name}</h3>
                      <p className="text-[#FF5C00] font-bold">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:text-[#FF5C00]"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:text-[#FF5C00]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="bg-white p-8 rounded-[3rem] premium-shadow h-fit sticky top-32">
              <h3 className="text-xl font-bold mb-8">Order Summary</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">
                    ${total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-gray-900">$2.00</span>
                </div>
                <div className="h-px bg-gray-100 my-4" />
                <div className="flex justify-between text-xl font-black">
                  <span>Total</span>
                  <span className="text-[#FF5C00]">
                    ${(total + 2).toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-[#FF5C00] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#E05200] transition-all shadow-xl shadow-orange-500/10 flex items-center justify-center gap-3 disabled:bg-gray-300"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-6 h-6" />
                    Place Order
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
