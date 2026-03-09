import { api, toQuery } from './http';
import type { BasketView, DeliveryOrder, Product, ProductQuery, SessionInfo } from './types';

export async function getSession(): Promise<SessionInfo> {
  return api<SessionInfo>('/session');
}

export async function registerUser(data: { name: string; password: string; email?: string; phone?: string; login?: string }): Promise<SessionInfo> {
  return api<SessionInfo>('/register', { method: 'POST', body: JSON.stringify(data) });
}

export async function loginUser(data: { identifier: string; password: string }): Promise<SessionInfo> {
  return api<SessionInfo>('/login', { method: 'POST', body: JSON.stringify(data) });
}

export async function logoutUser(): Promise<void> {
  await api<{ success: boolean }>('/logout', { method: 'POST' });
}

export async function getProducts(query: ProductQuery): Promise<Product[]> {
  return api<Product[]>(`/products${toQuery({
    search: query.search,
    category: query.category,
    isAvailable: query.isAvailable,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    sort: query.sort,
    hasDiscount: query.hasDiscount
  })}`);
}

export async function getBasket(): Promise<BasketView> {
  return api<BasketView>('/basket');
}

export async function addToBasket(productId: string, quantity: number): Promise<BasketView> {
  return api<BasketView>('/basket/add', { method: 'POST', body: JSON.stringify({ productId, quantity }) });
}

export async function updateBasket(productId: string, quantity: number): Promise<BasketView> {
  return api<BasketView>('/basket/update', { method: 'PUT', body: JSON.stringify({ productId, quantity }) });
}

export async function removeFromBasket(productId: string): Promise<BasketView> {
  return api<BasketView>(`/basket/remove/${encodeURIComponent(productId)}`, { method: 'DELETE' });
}

export async function getDeliveries(): Promise<DeliveryOrder[]> {
  return api<DeliveryOrder[]>('/delivery');
}

export async function createDelivery(form: {
  address: { country?: string; town?: string; street?: string; houseNumber?: string };
  phone: string;
  email: string;
  paymentMethod: 'card' | 'cash';
  comment?: string;
}): Promise<DeliveryOrder> {
  return api<DeliveryOrder>('/delivery', { method: 'POST', body: JSON.stringify(form) });
}
