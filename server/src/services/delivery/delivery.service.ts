import { promises as fs } from 'fs';
import path from 'path';
import { DeliveryData, DeliveryForm, DeliveryOrder } from '../../types';
import { buildBasketView, clearBasketForUser } from '../view/view.service';

const deliveryFilePath = path.join(__dirname, '../../../database/delivery.json');

async function readText(): Promise<string | null> {
  try {
    return await fs.readFile(deliveryFilePath, 'utf-8');
  } catch {
    return null;
  }
}

export async function readDeliveries(): Promise<DeliveryData> {
  const text = await readText();
  if (!text) return {};
  const raw: unknown = JSON.parse(text);
  if (!raw || typeof raw !== 'object') return {};
  return raw as DeliveryData;
}

export async function writeDeliveries(data: DeliveryData): Promise<void> {
  await fs.writeFile(deliveryFilePath, JSON.stringify(data, null, 2));
}

export async function getDeliveriesForUser(userId: string): Promise<DeliveryOrder[]> {
  const data = await readDeliveries();
  return data[userId] || [];
}

export async function createDeliveryFromBasket(userId: string, form: DeliveryForm): Promise<DeliveryOrder> {
  const basket = await buildBasketView(userId);

  if (basket.items.length === 0) {
    throw new Error('Basket is empty');
  }

  const order: DeliveryOrder = {
    id: Date.now().toString(),
    userId,
    createdAt: new Date().toISOString(),
    address: form.address,
    contact: { phone: form.phone, email: form.email },
    paymentMethod: form.paymentMethod,
    comment: form.comment,
    items: basket.items,
    total: basket.total
  };

  const data = await readDeliveries();
  const list = data[userId] || [];
  list.unshift(order);
  data[userId] = list;
  await writeDeliveries(data);

  // after successful delivery -> remove items from basket
  await clearBasketForUser(userId);

  return order;
}

// re-export for convenience
export { clearBasketForUser };
