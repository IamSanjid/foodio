'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Package, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const { orders, loading: ordersLoading, fetchMyOrders } = useOrders();

  useEffect(() => {
    if (!authLoading && user) {
      fetchMyOrders();
    }
  }, [user, authLoading, fetchMyOrders]);

  const loading = authLoading || ordersLoading;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'Preparing':
        return 'bg-blue-100 text-blue-600';
      case 'Ready':
        return 'bg-purple-100 text-purple-600';
      case 'Completed':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-[#FF5C00] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12">
        <h1 className="text-4xl font-black mb-10">Track Your Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] premium-shadow">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2">No orders found</h2>
            <p className="text-gray-500 mb-8">
              You haven&apos;t placed any orders yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] premium-shadow flex flex-col md:flex-row md:items-center justify-between gap-8"
              >
                <div className="flex items-center gap-6">
                  <div
                    className={`p-4 rounded-2xl ${getStatusColor(order.status)}`}
                  >
                    <Clock className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-black text-xl">
                        Order #{order.id}
                      </span>
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()} at{' '}
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                  <div className="text-right">
                    <p className="text-gray-400 text-sm font-medium">
                      Total Amount
                    </p>
                    <p className="text-2xl font-black text-[#FF5C00]">
                      ${Number(order.totalAmount).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-full hover:bg-gray-100 cursor-pointer transition-colors">
                    <ChevronRight className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
