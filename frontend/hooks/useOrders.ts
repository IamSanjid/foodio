import { useState, useCallback } from 'react';
import {
  createOrder,
  getMyOrders,
  getOrders,
  updateOrderStatus as updateOrderStatusRequest,
} from '@/lib/api/orders';
import { getErrorMessage } from '@/lib/errors';
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
        const data = await getOrders(params);
        setOrders(data.orders);
        setTotal(data.total);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to fetch orders'));
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
      const data = await getMyOrders();
      setOrders(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch your orders'));
    } finally {
      setLoading(false);
    }
  }, []);

  const placeOrder = async (
    items: { menuItemId: number; quantity: number }[]
  ) => {
    setLoading(true);
    setError(null);

    try {
      const data = await createOrder(items);
      return data;
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to place order'));
      throw new Error(getErrorMessage(err, 'Failed to place order'));
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: number, status: OrderStatus) => {
    try {
      await updateOrderStatusRequest(id, status);
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, 'Failed to update order status'));
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
