import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { MenuItem } from '@/types';

export function useMenuItems() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(
    async (params?: {
      name?: string;
      categoryId?: number;
      limit?: number;
      offset?: number;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams();
        if (params?.name) query.append('name', params.name);
        if (params?.categoryId)
          query.append('categoryId', params.categoryId.toString());
        if (params?.limit) query.append('limit', params.limit.toString());
        if (params?.offset) query.append('offset', params.offset.toString());

        const { data } = await api.get(`/menu-items?${query.toString()}`);
        setItems(data.items);
        setTotal(data.total);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch menu items';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const saveItem = async (data: Partial<MenuItem>, id?: number) => {
    try {
      if (id) {
        await api.patch(`/menu-items/${id}`, data);
      } else {
        await api.post('/menu-items', data);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save menu item';
      throw new Error(message);
    }
  };

  const deleteItem = async (id: number) => {
    try {
      await api.delete(`/menu-items/${id}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete menu item';
      throw new Error(message);
    }
  };

  return {
    items,
    total,
    loading,
    error,
    fetchItems,
    saveItem,
    deleteItem,
  };
}
