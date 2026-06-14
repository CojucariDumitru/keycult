export type Category = 'KEYBOARD' | 'KEYCAP' | 'SWITCH' | 'ACCESSORY' | 'DESKMAT';

export type Role = 'USER' | 'ADMIN';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  price: number; // cents
  category: Category;
  images: string[];
  stock: number;
  featured: boolean;
  rating: number;
  reviewCount: number;
  specs?: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  email: string;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  shippingName?: string | null;
  shippingCity?: string | null;
  shippingCountry?: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductListResponse {
  products: Product[];
  pagination: Pagination;
}

export interface CartLine {
  product: Product;
  quantity: number;
}

export interface AdminStats {
  kpis: {
    revenue: number;
    orders: number;
    paidOrders: number;
    products: number;
    customers: number;
    lowStock: number;
  };
  revenueByDay: { date: string; total: number }[];
  topProducts: { name: string; sold: number }[];
  recentOrders: Order[];
}
