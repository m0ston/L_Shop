import { promises as fs } from 'fs';
import path from 'path';
import { BasketData, BasketItem } from '../../types';
import { getProductById } from '../products/products.service';

const basketFilePath = path.join(__dirname, '../../../database/basket.json');

async function readText(): Promise<string | null> {
  try {
    return await fs.readFile(basketFilePath, 'utf-8');
  } catch {
    return null;
  }
}

export async function readBasket(): Promise<BasketData> {
  const text = await readText();
  if (!text) return {};
  const raw: unknown = JSON.parse(text);
  if (!raw || typeof raw !== 'object') return {};
  return raw as BasketData;
}

export async function writeBasket(basket: BasketData): Promise<void> {
  await fs.writeFile(basketFilePath, JSON.stringify(basket, null, 2));
}

export async function getBasketRaw(userId: string): Promise<BasketItem[]> {
  const basket = await readBasket();
  return basket[userId] || [];
}

export async function addToBasketRaw(userId: string, productId: string, quantity: number = 1): Promise<BasketItem[]> {
  const basket = await readBasket();
  const userBasket = basket[userId] || [];

  const existing = userBasket.find(i => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    const product = await getProductById(productId);
    if (!product) throw new Error('Product not found');
    userBasket.push({ productId, quantity });
  }

  basket[userId] = userBasket;
  await writeBasket(basket);
  return userBasket;
}

export async function updateBasketItemRaw(userId: string, productId: string, quantity: number): Promise<BasketItem[]> {
  if (quantity <= 0) {
    return removeFromBasketRaw(userId, productId);
  }
  const basket = await readBasket();
  const userBasket = basket[userId] || [];

  const item = userBasket.find(i => i.productId === productId);
  if (!item) throw new Error('Item not found in basket');
  item.quantity = quantity;

  basket[userId] = userBasket;
  await writeBasket(basket);
  return userBasket;
}

export async function removeFromBasketRaw(userId: string, productId: string): Promise<BasketItem[]> {
  const basket = await readBasket();
  const userBasket = basket[userId] || [];

  const updated = userBasket.filter(i => i.productId !== productId);
  if (updated.length === 0) delete basket[userId];
  else basket[userId] = updated;

  await writeBasket(basket);
  return updated;
}

export async function clearBasketRaw(userId: string): Promise<void> {
  const basket = await readBasket();
  delete basket[userId];
  await writeBasket(basket);
}
