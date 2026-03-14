import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { Order, OrderStatus } from '@/types';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(
    async (params?: { limit?: number; offset?: number }) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(
          `/orders?limit=${params?.limit || 10}&offset=${params?.offset || 0}`
        );
        setOrders(data.orders);
        setTotal(data.total);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch orders';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchMyOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/orders/my-orders');
      setOrders(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch your orders';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const placeOrder = async (
    items: { menuItemId: number; quantity: number }[]
  ) => {
    try {
      const { data } = await api.post('/orders', { items });
      return data;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to place order';
      throw new Error(message);
    }
  };

  const updateOrderStatus = async (id: number, status: OrderStatus) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update order status';
      throw new Error(message);
    }
  };

  return {
    orders,
    total,
    loading,
    error,
    fetchOrders,
    fetchMyOrders,
    placeOrder,
    updateOrderStatus,
  };
}
