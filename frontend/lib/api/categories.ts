import api from '@/lib/api';
import { categorySchema } from '@/lib/schemas';
import { Category } from '@/types';

export async function getCategories() {
  const { data } = await api.get<Category[]>('/categories');
  return data;
}

export async function createCategory(payload: { name: string }) {
  const safePayload = categorySchema.parse(payload);
  await api.post('/categories', safePayload);
}

export async function updateCategory(id: number, payload: { name: string }) {
  const safePayload = categorySchema.parse(payload);
  await api.patch(`/categories/${id}`, safePayload);
}

export async function deleteCategory(id: number) {
  await api.delete(`/categories/${id}`);
}
