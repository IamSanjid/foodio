import api from '@/lib/api';
import { placeOrderSchema } from '@/lib/schemas';
import { Order, OrderStatus } from '@/types';

export type OrdersQuery = {
  limit?: number;
  offset?: number;
};

export type OrdersListResponse = {
  orders: Order[];
  total: number;
};

export type PlaceOrderItem = {
  menuItemId: number;
  quantity: number;
};

export async function getOrders(params?: OrdersQuery) {
  const query = new URLSearchParams();
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.offset) query.append('offset', String(params.offset));

  const suffix = query.toString();
  const endpoint = suffix ? `/orders?${suffix}` : '/orders';
  const { data } = await api.get<OrdersListResponse>(endpoint);
  return data;
}

export async function getMyOrders() {
  const { data } = await api.get<Order[]>('/orders/my-orders');
  return data;
}

export async function createOrder(items: PlaceOrderItem[]) {
  const payload = placeOrderSchema.parse({ items });
  const { data } = await api.post<Order>('/orders', payload);
  return data;
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  await api.patch(`/orders/${id}/status`, { status });
}
