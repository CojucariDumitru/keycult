import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type {
  Product,
  ProductListResponse,
  Order,
  AdminStats,
} from '../types';

export interface ProductFilters {
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
}

function toQuery(filters: ProductFilters): string {
  const p = new URLSearchParams();
  if (filters.category) p.set('category', filters.category);
  if (filters.search) p.set('search', filters.search);
  if (filters.sort) p.set('sort', filters.sort);
  if (filters.page) p.set('page', String(filters.page));
  if (filters.limit) p.set('limit', String(filters.limit));
  if (filters.minPrice) p.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice) p.set('maxPrice', String(filters.maxPrice));
  const s = p.toString();
  return s ? `?${s}` : '';
}

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.get<ProductListResponse>(`/products${toQuery(filters)}`),
  });
}

export function useFeatured() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => api.get<{ products: Product[] }>('/products/featured'),
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.get<{ product: Product; related: Product[] }>(`/products/${slug}`),
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<{ categories: { category: string; count: number }[] }>('/products/categories'),
  });
}

export function useMyOrders() {
  return useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: () => api.get<{ orders: Order[] }>('/orders'),
  });
}

export function useOrderBySession(sessionId: string | null) {
  return useQuery({
    queryKey: ['order', 'session', sessionId],
    queryFn: () => api.get<{ order: Order }>(`/orders/by-session/${sessionId}`),
    enabled: !!sessionId,
    retry: 5,
    retryDelay: (attempt) => Math.min(2000 * (attempt + 1), 8000),
  });
}

/* ----------------------------- Admin ----------------------------- */

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get<AdminStats>('/admin/stats'),
  });
}

export function useAdminOrders(status?: string) {
  return useQuery({
    queryKey: ['admin', 'orders', status],
    queryFn: () =>
      api.get<{ orders: Order[] }>(`/orders/admin/all${status ? `?status=${status}` : ''}`),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch<{ order: Order }>(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}
