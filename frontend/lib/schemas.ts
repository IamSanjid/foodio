import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(100),
});

export const menuItemCreateSchema = z.object({
  name: z.string().trim().min(1, 'Item name is required').max(150),
  description: z.string().max(1000).optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  image: z.string().max(2048).optional(),
  categoryId: z.number().int().min(1).optional(),
  isAvailable: z.boolean().optional(),
});

export const menuItemUpdateSchema = menuItemCreateSchema.partial();

export const placeOrderSchema = z.object({
  items: z
    .array(
      z.object({
        menuItemId: z.number().int().min(1),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .min(1, 'Cart must contain at least one item'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type MenuItemCreateInput = z.infer<typeof menuItemCreateSchema>;
export type MenuItemUpdateInput = z.infer<typeof menuItemUpdateSchema>;
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
