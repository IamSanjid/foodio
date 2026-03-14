import { useState, useCallback } from 'react';
import {
  createMenuItem,
  deleteMenuItem,
  getMenuItems,
  type MenuItemsQuery,
  updateMenuItem,
} from '@/lib/api/menu-items';
import { getErrorMessage } from '@/lib/errors';
import {
  type MenuItemCreateInput,
  type MenuItemUpdateInput,
} from '@/lib/schemas';
import { MenuItem } from '@/types';

export function useMenuItems() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async (params?: MenuItemsQuery) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMenuItems(params);
      setItems(data.items);
      setTotal(data.total);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch menu items'));
    } finally {
      setLoading(false);
    }
  }, []);

  const saveItem = async (
    data: Partial<MenuItemCreateInput & MenuItemUpdateInput>,
    id?: number
  ) => {
    try {
      if (id) {
        await updateMenuItem(id, data);
      } else {
        await createMenuItem(data as MenuItemCreateInput);
      }
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, 'Failed to save menu item'));
    }
  };

  const deleteItem = async (id: number) => {
    try {
      await deleteMenuItem(id);
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, 'Failed to delete menu item'));
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
