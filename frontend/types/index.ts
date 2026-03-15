export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum OrderStatus {
  PENDING = 'Pending',
  PREPARING = 'Preparing',
  READY = 'Ready',
  COMPLETED = 'Completed',
}

export interface Category {
  id: number;
  name: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  category: Category;
}

export interface OrderItem {
  id: number;
  quantity: number;
  priceAtTime: number;
  menuItem: MenuItem;
}

export interface User {
  id: number;
  email: string;
  name: string;
  address?: string;
  role: UserRole;
}

export interface Order {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  user: User;
  items: OrderItem[];
}
