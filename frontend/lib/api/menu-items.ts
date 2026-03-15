import api from '@/lib/api';
import {
  menuItemCreateSchema,
  menuItemUpdateSchema,
  type MenuItemCreateInput,
  type MenuItemUpdateInput,
} from '@/lib/schemas';
import { MenuItem } from '@/types';

export type MenuItemsQuery = {
  name?: string;
  categoryId?: number;
  isAvailable?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
};

export type MenuItemsResponse = {
  items: MenuItem[];
  total: number;
};

export async function getMenuItems(query?: MenuItemsQuery) {
  const params = new URLSearchParams();
  if (query?.name) params.append('name', query.name);
  if (query?.categoryId) params.append('categoryId', String(query.categoryId));
  if (query?.isAvailable !== undefined) {
    params.append('isAvailable', String(query.isAvailable));
  }
  if (query?.limit) params.append('limit', String(query.limit));
  if (query?.offset) params.append('offset', String(query.offset));
  if (query?.sortBy) params.append('sortBy', query.sortBy);
  if (query?.sortOrder) params.append('sortOrder', query.sortOrder);

  const suffix = params.toString();
  const endpoint = suffix ? `/menu-items?${suffix}` : '/menu-items';
  const { data } = await api.get<MenuItemsResponse>(endpoint);
  return data;
}

export async function getMenuItemById(id: string | number) {
  const { data } = await api.get<MenuItem>(`/menu-items/${id}`);
  return data;
}

export async function createMenuItem(payload: MenuItemCreateInput) {
  const safePayload = menuItemCreateSchema.parse(payload);
  await api.post('/menu-items', safePayload);
}

export async function updateMenuItem(id: number, payload: MenuItemUpdateInput) {
  const safePayload = menuItemUpdateSchema.parse(payload);
  await api.patch(`/menu-items/${id}`, safePayload);
}

export async function deleteMenuItem(id: number) {
  await api.delete(`/menu-items/${id}`);
}

export async function uploadMenuItemImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post<{ url: string }>(
    '/menu-items/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return data;
}
