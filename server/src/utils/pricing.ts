import { Product } from '../types';

export function getUnitPrice(product: Product): number {
  const discount = product.discount ?? 0;
  const safeDiscount = Math.min(100, Math.max(0, discount));
  const discounted = product.price * (1 - safeDiscount / 100);
  return Math.round(discounted);
}
