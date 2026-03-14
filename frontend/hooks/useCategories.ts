import { useState, useCallback } from 'react';
import {
  createCategory as createCategoryRequest,
  deleteCategory as deleteCategoryRequest,
  getCategories,
  updateCategory as updateCategoryRequest,
} from '@/lib/api/categories';
import { getErrorMessage } from '@/lib/errors';
import { Category } from '@/types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch categories'));
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = async (name: string) => {
    try {
      await createCategoryRequest({ name });
      await fetchCategories();
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, 'Failed to create category'));
    }
  };

  const updateCategory = async (id: number, name: string) => {
    try {
      await updateCategoryRequest(id, { name });
      await fetchCategories();
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, 'Failed to update category'));
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await deleteCategoryRequest(id);
      await fetchCategories();
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err, 'Failed to delete category'));
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
