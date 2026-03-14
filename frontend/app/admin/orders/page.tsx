'use client';

import { useState, useEffect } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { OrderStatus } from '@/types';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Pagination from '@/components/shared/Pagination';

export default function OrderQueue() {
  const { orders, total, loading, fetchOrders, updateOrderStatus } =
    useOrders();

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 5;

  useEffect(() => {
    fetchOrders({ limit, offset: (currentPage - 1) * limit });
  }, [fetchOrders, currentPage]);

  const handleStatusUpdate = async (id: number, status: OrderStatus) => {
    try {
      await updateOrderStatus(id, status);
      fetchOrders({ limit, offset: (currentPage - 1) * limit });
    } catch {
      alert('Failed to update status');
    }
  };

  const statusOptions = Object.values(OrderStatus);
  const nextStatus = (current: OrderStatus) =>
    statusOptions[statusOptions.indexOf(current) + 1] as
      | OrderStatus
      | undefined;

  if (loading)
    return (
      <Loader2 className="w-10 h-10 animate-spin text-[#FF5C00] mx-auto mt-20" />
    );

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
                {statusOptions.map((status) => {
                  const isCurrent = order.status === status;
                  const isNext = nextStatus(order.status) === status;
                  const isDisabled = !isNext;
                  return (
                    <button
                      key={status}
                      onClick={() =>
                        !isDisabled && handleStatusUpdate(order.id, status)
                      }
                      disabled={isDisabled}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-[#FF5C00] text-white shadow-lg shadow-orange-500/20'
                          : isNext
                            ? 'bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-[#FF5C00] cursor-pointer'
                            : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="grow">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Items Ordered
                </p>
                <div className="flex flex-wrap gap-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
                    >
                      <span className="text-[#FF5C00] font-bold">
                        {item.quantity}x
                      </span>
                      <span>{item.menuItem?.name || 'Item Removed'}</span>
                      <span className="text-gray-400">${item.priceAtTime}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right min-w-50">
                <p className="text-gray-400 text-sm font-medium mb-1">
                  Total Bill
                </p>
                <p className="text-3xl font-black text-[#FF5C00]">
                  ${Number(order.totalAmount).toFixed(2)}
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[3rem] premium-shadow text-gray-400 font-bold text-lg">
            No orders in the queue.
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          total={total}
          limit={limit}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
