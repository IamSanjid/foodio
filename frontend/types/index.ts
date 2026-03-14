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
  role: string;
}

export interface Order {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  user: User;
  items: OrderItem[];
}
