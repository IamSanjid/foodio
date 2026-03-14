'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Order } from '@/types';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OrderQueue() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/orders?limit=${limit}&offset=${(currentPage - 1) * limit}`);
      setOrders(data.orders);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const statusOptions = ['Pending', 'Preparing', 'Ready', 'Completed'];

  if (loading) return <Loader2 className="w-10 h-10 animate-spin text-[#FF5C00] mx-auto mt-20" />;

  return (
    <div>
      <h1 className="text-3xl font-black mb-10">Order Queue</h1>

      <div className="grid grid-cols-1 gap-6">
        {orders.map((order) => (
          <motion.div 
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[2.5rem] premium-shadow"
          >
            <div className="flex flex-col md:flex-row justify-between gap-8 mb-8 border-b border-gray-50 pb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <span className="font-black text-xl">#{order.id}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{order.user.name}</h3>
                  <p className="text-gray-400 text-sm">{order.user.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {statusOptions.map((status) => (
                  <button 
                    key={status}
                    onClick={() => handleStatusUpdate(order.id, status)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      order.status === status 
                      ? 'bg-[#FF5C00] text-white shadow-lg shadow-orange-500/20' 
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="flex-grow">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Items Ordered</p>
                <div className="flex flex-wrap gap-3">
                  {order.items.map((item: { id: number; quantity: number; menuItem: { name: string }; priceAtTime: number }) => (
                    <div key={item.id} className="bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
                       <span className="text-[#FF5C00] font-bold">{item.quantity}x</span>
                       <span>{item.menuItem?.name || 'Item Removed'}</span>
                       <span className="text-gray-400">${item.priceAtTime}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right min-w-[200px]">
                <p className="text-gray-400 text-sm font-medium mb-1">Total Bill</p>
                <p className="text-3xl font-black text-[#FF5C00]">${Number(order.totalAmount).toFixed(2)}</p>
                <p className="text-gray-400 text-xs mt-2">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[3rem] premium-shadow text-gray-400 font-bold text-lg">
            No orders in the queue.
          </div>
        )}

        {total > limit && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-6 py-3 bg-white rounded-2xl font-bold premium-shadow disabled:opacity-50"
            >
              Previous
            </button>
            <span className="font-bold text-gray-500">Page {currentPage} of {Math.ceil(total / limit)}</span>
            <button 
              disabled={currentPage >= Math.ceil(total / limit)}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-6 py-3 bg-white rounded-2xl font-bold premium-shadow disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
