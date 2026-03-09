import { Request, Response } from 'express';
import { createDeliveryFromBasket, getDeliveriesForUser } from '../../services/delivery/delivery.service';
import { getCookieValue } from '../../utils/cookies';
import { DeliveryForm } from '../../types';

function getUserId(req: Request): string | null {
  return getCookieValue(req, 'userId');
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

export async function getDeliveryListHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const deliveries = await getDeliveriesForUser(userId);
    res.json(deliveries);
  } catch {
    res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
}

export async function createDeliveryHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const address = (body.address && typeof body.address === 'object') ? (body.address as Record<string, unknown>) : {};
    const phone = body.phone;
    const email = body.email;
    const paymentMethod = body.paymentMethod;

    if (!isNonEmptyString(phone) || !isNonEmptyString(email)) {
      res.status(400).json({ error: 'phone and email are required' });
      return;
    }

    if (paymentMethod !== 'card' && paymentMethod !== 'cash') {
      res.status(400).json({ error: 'paymentMethod must be card or cash' });
      return;
    }

    const form: DeliveryForm = {
      address: {
        country: isNonEmptyString(address.country) ? address.country.trim() : undefined,
        town: isNonEmptyString(address.town) ? address.town.trim() : undefined,
        street: isNonEmptyString(address.street) ? address.street.trim() : undefined,
        houseNumber: isNonEmptyString(address.houseNumber) ? address.houseNumber.trim() : undefined
      },
      phone: phone.trim(),
      email: email.trim(),
      paymentMethod,
      comment: isNonEmptyString(body.comment) ? body.comment.trim() : undefined
    };

    const order = await createDeliveryFromBasket(userId, form);
    res.status(201).json(order);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed';
    if (msg === 'Basket is empty') {
      res.status(400).json({ error: msg });
      return;
    }
    res.status(500).json({ error: 'Failed to create delivery' });
  }
}
