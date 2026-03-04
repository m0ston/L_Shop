import { Request, Response } from 'express';
import { getBasket, addToBasket, updateBasketItem, removeFromBasket, clearBasket } from '../../services/basket/basket.service';

// Получаем userId из куки (устанавливается при логине)
function getUserId(req: Request): string | null {
  return req.cookies?.userId || null;
}

export async function getBasketHandler(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const basket = await getBasket(userId);
    res.json(basket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch basket' });
  }
}

export async function addToBasketHandler(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { productId, quantity } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId is required' });
    const basket = await addToBasket(userId, productId, quantity || 1);
    res.json(basket);
  } catch (error: any) {
    if (error.message === 'Product not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to add to basket' });
  }
}

export async function updateBasketHandler(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { productId, quantity } = req.body;
    if (!productId || quantity === undefined) {
      return res.status(400).json({ error: 'productId and quantity are required' });
    }
    const basket = await updateBasketItem(userId, productId, quantity);
    res.json(basket);
  } catch (error: any) {
    if (error.message === 'Item not found in basket') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update basket' });
  }
}

export async function removeFromBasketHandler(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const productIdParam = req.params.productId;
    if (!productIdParam) {
      return res.status(400).json({ error: 'productId is required' });
    }
    const productId = Array.isArray(productIdParam) ? productIdParam[0] : productIdParam;

    const basket = await removeFromBasket(userId, productId);
    res.json(basket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from basket' });
  }
}

export async function clearBasketHandler(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    await clearBasket(userId);
    res.json({ message: 'Basket cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear basket' });
  }
}