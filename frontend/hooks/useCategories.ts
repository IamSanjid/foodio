import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { Category } from '@/types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = async (name: string) => {
    try {
      await api.post('/categories', { name });
      fetchCategories();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create category';
      throw new Error(message);
    }
  };

  const updateCategory = async (id: number, name: string) => {
    try {
      await api.patch(`/categories/${id}`, { name });
      fetchCategories();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update category';
      throw new Error(message);
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete category';
      throw new Error(message);
    }
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
