import { promises as fs } from 'fs';
import path from 'path';
import { BasketItem, BasketData } from '../../types';
import { getProductById } from '../products/products.service';

const basketFilePath = path.join(__dirname, '../../../database/basket.json');

// Чтение всей корзины
export async function readBasket(): Promise<BasketData> {
  try {
    const data = await fs.readFile(basketFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

// Запись всей корзины
export async function writeBasket(basket: BasketData): Promise<void> {
  await fs.writeFile(basketFilePath, JSON.stringify(basket, null, 2));
}

// Получить корзину пользователя
export async function getBasket(userId: string): Promise<BasketItem[]> {
  const basket = await readBasket();
  return basket[userId] || [];
}

// Добавить товар в корзину (или увеличить количество)
export async function addToBasket(userId: string, productId: string, quantity: number = 1): Promise<BasketItem[]> {
  const basket = await readBasket();
  const userBasket = basket[userId] || [];
  
  const existingItem = userBasket.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    // Проверяем, существует ли товар
    const product = await getProductById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    userBasket.push({ productId, quantity });
  }
  
  basket[userId] = userBasket;
  await writeBasket(basket);
  return userBasket;
}

// Обновить количество конкретного товара
export async function updateBasketItem(userId: string, productId: string, quantity: number): Promise<BasketItem[]> {
  if (quantity <= 0) {
    return removeFromBasket(userId, productId);
  }
  
  const basket = await readBasket();
  const userBasket = basket[userId] || [];
  
  const item = userBasket.find(item => item.productId === productId);
  if (item) {
    item.quantity = quantity;
  } else {
    throw new Error('Item not found in basket');
  }
  
  basket[userId] = userBasket;
  await writeBasket(basket);
  return userBasket;
}

// Удалить товар из корзины
export async function removeFromBasket(userId: string, productId: string): Promise<BasketItem[]> {
  const basket = await readBasket();
  const userBasket = basket[userId] || [];
  
  const updatedBasket = userBasket.filter(item => item.productId !== productId);
  if (updatedBasket.length === 0) {
    delete basket[userId];
  } else {
    basket[userId] = updatedBasket;
  }
  
  await writeBasket(basket);
  return updatedBasket;
}

// Очистить корзину пользователя
export async function clearBasket(userId: string): Promise<void> {
  const basket = await readBasket();
  delete basket[userId];
  await writeBasket(basket);
}