'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, Loader2, X } from 'lucide-react';
import { Cormorant_Garamond } from 'next/font/google';
import { useOrders } from '@/hooks/useOrders';
import { Order, OrderStatus } from '@/types';
import Pagination from '@/components/shared/Pagination';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600'],
});

export default function OrderManagement() {
  const { orders, total, loading, fetchOrders, updateOrderStatus } =
    useOrders();

  const [currentPage, setCurrentPage] = useState(1);
  const [openStatusMenuOrderId, setOpenStatusMenuOrderId] = useState<
    number | null
  >(null);
  const [statusMenuPosition, setStatusMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const limit = 10;
  const statusOptions = useMemo(() => Object.values(OrderStatus), []);

  useEffect(() => {
    fetchOrders({ limit, offset: (currentPage - 1) * limit });
  }, [fetchOrders, currentPage]);

  useEffect(() => {
    if (!openStatusMenuOrderId) {
      return;
    }

    const closeMenu = () => {
      setOpenStatusMenuOrderId(null);
      setStatusMenuPosition(null);
    };

    window.addEventListener('resize', closeMenu);
    window.addEventListener('scroll', closeMenu, true);

    return () => {
      window.removeEventListener('resize', closeMenu);
      window.removeEventListener('scroll', closeMenu, true);
    };
  }, [openStatusMenuOrderId]);

  const formatOrderDate = (dateString: string) =>
    new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  const formatOrderId = (id: number) => {
    const idString = String(id);
    if (idString.length <= 8) return `${idString}`;
    return `${idString.slice(0, 8)}...`;
  };

  const handleStatusUpdate = async (orderId: number, status: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await updateOrderStatus(orderId, status);
      await fetchOrders({ limit, offset: (currentPage - 1) * limit });
    } catch {
      alert('Failed to update status');
    } finally {
      setUpdatingOrderId(null);
      setOpenStatusMenuOrderId(null);
      setStatusMenuPosition(null);
    }
  };

  const handleStatusMenuToggle = (
    event: React.MouseEvent<HTMLButtonElement>,
    orderId: number
  ) => {
    if (openStatusMenuOrderId === orderId) {
      setOpenStatusMenuOrderId(null);
      setStatusMenuPosition(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 148;
    const viewportPadding = 12;
    const left = Math.min(
      Math.max(viewportPadding, rect.right - menuWidth),
      window.innerWidth - menuWidth - viewportPadding
    );

    setOpenStatusMenuOrderId(orderId);
    setStatusMenuPosition({
      top: rect.bottom + 8,
      left,
    });
  };

  const getAddressText = (order: Order) => {
    const maybeAddress = (order.user as { address?: string }).address;
    return maybeAddress || 'Address unavailable';
  };

  if (loading && !orders.length) {
    return (
      <Loader2 className="mx-auto mt-20 h-10 w-10 animate-spin text-[#1A4B42]" />
    );
  }

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden bg-[#F8F8F8]"
      onClick={() => {
        setOpenStatusMenuOrderId(null);
        setStatusMenuPosition(null);
      }}
    >
      <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-3">
        <h1
          className={`${cormorant.className} text-[26px] leading-[26px] font-semibold tracking-[-0.05em] text-[#1A3C34]`}
        >
          Order Management
        </h1>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-6">
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#E6E2D8] bg-white">
          <div className="min-h-0 flex-1 overflow-auto">
            <div className="overflow-x-auto">
              <table className="w-full min-w-220 text-sm text-[#1A1A1A]">
                <thead>
                  <tr className="border-b border-[#E6E2D8] text-left bg-white">
                    <th className="px-4 py-3 text-sm leading-5 font-semibold tracking-[-0.150391px]">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-sm leading-5 font-semibold tracking-[-0.150391px]">
                      Date
                    </th>
                    <th className="px-4 py-3 text-sm leading-5 font-semibold tracking-[-0.150391px]">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-sm leading-5 font-semibold tracking-[-0.150391px]">
                      Total
                    </th>
                    <th className="px-4 py-3 text-sm leading-5 font-semibold tracking-[-0.150391px]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-sm leading-5 font-semibold tracking-[-0.150391px]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-[#EDE8DE] last:border-0"
                    >
                      <td className="px-4 py-2 text-sm leading-5 tracking-[-0.150391px] text-[#1A1A1A]">
                        {formatOrderId(order.id)}
                      </td>
                      <td className="px-4 py-2 text-sm leading-5 tracking-[-0.150391px] text-[#1A1A1A]">
                        {formatOrderDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-2 text-sm leading-5 tracking-[-0.150391px] text-[#1A1A1A]">
                        {order.user.name}
                      </td>
                      <td className="px-4 py-2 text-sm leading-5 tracking-[-0.150391px] text-[#1A1A1A]">
                        ${Number(order.totalAmount).toFixed(2)}
                      </td>
                      <td className="px-4 py-2">
                        <div
                          className="relative inline-flex"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="flex h-8 w-25 items-center justify-between rounded-md border border-[#E6E2D8] bg-[#FBFAF8] px-3 text-sm leading-5 font-medium tracking-[-0.150391px] text-[#1A1A1A] shadow-[0px_1px_2px_rgba(26,26,26,0.04)]"
                            onClick={(event) =>
                              handleStatusMenuToggle(event, order.id)
                            }
                            disabled={updatingOrderId === order.id}
                          >
                            {updatingOrderId === order.id
                              ? 'Updating...'
                              : order.status}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="h-8 rounded-md border border-[#E6E2D8] bg-[#FBFAF8] px-3 text-sm leading-5 font-medium tracking-[-0.150391px] text-[#1A1A1A]"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {orders.length === 0 && (
              <div className="flex min-h-[220px] items-center justify-center px-4 py-10 text-center text-sm text-[#7A7A7A]">
                No orders found.
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-[#E6E2D8] px-6 py-4">
            <Pagination
              currentPage={currentPage}
              total={total}
              limit={limit}
              onPageChange={setCurrentPage}
            />
          </div>
        </section>
      </div>

      {openStatusMenuOrderId !== null && statusMenuPosition && (
        <div
          className="fixed z-[80] min-w-[148px] overflow-hidden rounded-xl border border-[#E6E2D8] bg-white py-1 shadow-[0px_16px_32px_rgba(26,26,26,0.12)]"
          style={{
            top: statusMenuPosition.top,
            left: statusMenuPosition.left,
          }}
          role="menu"
          onClick={(event) => event.stopPropagation()}
        >
          {statusOptions.map((status) => {
            const order = orders.find(
              (candidate) => candidate.id === openStatusMenuOrderId
            );
            const isSelected = order?.status === status;

            return (
              <button
                key={status}
                type="button"
                onClick={() =>
                  handleStatusUpdate(openStatusMenuOrderId, status)
                }
                className={`flex w-full items-center justify-between px-3 py-2 text-sm leading-5 font-medium tracking-[-0.150391px] text-[#1A1A1A] transition-colors hover:bg-[#F7F7F7] ${
                  isSelected ? 'bg-[#F7F7F7]' : 'bg-white'
                }`}
              >
                <span>{status}</span>
                {isSelected ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="h-4 w-4" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-6">
          <div className="relative max-h-[calc(100vh-3rem)] w-full max-w-128 overflow-y-auto rounded-xl border border-[#E6E2D8] bg-[#FBFAF8] px-[25px] pb-6 pt-6 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="absolute right-[25px] top-[25px] opacity-70 text-[#7A7A7A]"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="max-w-full text-[18px] leading-[25px] font-bold text-[#1A3C34]">
              Order Details
              <br />#{selectedOrder.id}
            </h2>

            <div className="mt-[18px] flex w-full flex-col gap-[10px]">
              <div>
                <p className="text-sm leading-[14px] font-medium tracking-[-0.150391px] text-[#1A1A1A]">
                  Address
                </p>
                <p className="mt-[6px] text-sm leading-5 font-normal tracking-[-0.150391px] text-[#7A7A7A]">
                  {getAddressText(selectedOrder)}
                </p>
              </div>

              <div className="border-t border-[#E6E2D8] pt-[17px]">
                <p className="text-sm leading-[14px] font-medium tracking-[-0.150391px] text-[#1A1A1A]">
                  Items
                </p>

                <div className="mt-2 space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between text-sm leading-5 tracking-[-0.150391px]"
                    >
                      <span className="font-medium text-[#1A1A1A]">
                        {item.quantity}x {item.menuItem?.name || 'Item Removed'}
                      </span>
                      <span className="font-medium text-[#7A7A7A]">
                        ${Number(item.priceAtTime).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex items-start justify-between border-t border-[#E6E2D8] pt-2">
                  <span className="text-base leading-6 font-bold tracking-[-0.3125px] text-[#1A1A1A]">
                    Total
                  </span>
                  <span className="text-base leading-6 font-bold tracking-[-0.3125px] text-[#1A1A1A]">
                    ${Number(selectedOrder.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
