import { Request, Response } from 'express';
import { addToBasketRaw, removeFromBasketRaw, updateBasketItemRaw } from '../../services/basket/basket.service';
import { buildBasketView } from '../../services/view/view.service';
import { getCookieValue } from '../../utils/cookies';

function getUserId(req: Request): string | null {
  return getCookieValue(req, 'userId');
}

export async function getBasketHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const basket = await buildBasketView(userId);
    res.json(basket);
  } catch {
    res.status(500).json({ error: 'Failed to fetch basket' });
  }
}

export async function addToBasketHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const productId = typeof body.productId === 'string' ? body.productId : null;
    const quantity = typeof body.quantity === 'number' ? body.quantity : (typeof body.quantity === 'string' ? Number(body.quantity) : 1);

    if (!productId) {
      res.status(400).json({ error: 'productId is required' });
      return;
    }

    await addToBasketRaw(userId, productId, Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1);
    const basket = await buildBasketView(userId);
    res.json(basket);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to add to basket';
    if (message === 'Product not found') {
      res.status(404).json({ error: message });
      return;
    }
    res.status(500).json({ error: 'Failed to add to basket' });
  }
}

export async function updateBasketHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const productId = typeof body.productId === 'string' ? body.productId : null;
    const quantity = typeof body.quantity === 'number' ? body.quantity : (typeof body.quantity === 'string' ? Number(body.quantity) : null);

    if (!productId || quantity === null || !Number.isFinite(quantity)) {
      res.status(400).json({ error: 'productId and quantity are required' });
      return;
    }

    await updateBasketItemRaw(userId, productId, Math.floor(quantity));
    const basket = await buildBasketView(userId);
    res.json(basket);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to update basket';
    if (message === 'Item not found in basket') {
      res.status(404).json({ error: message });
      return;
    }
    res.status(500).json({ error: 'Failed to update basket' });
  }
}

export async function removeFromBasketHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const productIdParam = req.params.productId;
    if (typeof productIdParam !== 'string') {
      res.status(400).json({ error: 'productId must be a string' });
      return;
    }
    if (!productIdParam) {
      res.status(400).json({ error: 'productId is required' });
      return;
    }

    await removeFromBasketRaw(userId, productIdParam);
    const basket = await buildBasketView(userId);
    res.json(basket);
  } catch {
    res.status(500).json({ error: 'Failed to remove from basket' });
  }
}
