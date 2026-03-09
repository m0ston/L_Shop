import { BasketItemDetailed, BasketView } from '../../types';
import { getBasketRaw, clearBasketRaw } from '../basket/basket.service';
import { getProductById } from '../products/products.service';
import { getUnitPrice } from '../../utils/pricing';

export async function buildBasketView(userId: string): Promise<BasketView> {
  const raw = await getBasketRaw(userId);

  const detailed: BasketItemDetailed[] = [];
  for (const item of raw) {
    const product = await getProductById(item.productId);
    if (!product) continue; // product removed from catalog
    const unitPrice = getUnitPrice(product);
    const lineTotal = unitPrice * item.quantity;
    detailed.push({ product, quantity: item.quantity, unitPrice, lineTotal });
  }

  const total = detailed.reduce((sum, i) => sum + i.lineTotal, 0);
  return { items: detailed, total };
}

export async function clearBasketForUser(userId: string): Promise<void> {
  await clearBasketRaw(userId);
}
