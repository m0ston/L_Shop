import { Request, Response } from 'express';
import { buildBasketView } from '../../services/view/view.service';
import { getDeliveriesForUser } from '../../services/delivery/delivery.service';
import { createUser, findUserByIdentifierUnsafe, getUserById, getUserUnsafeById, isIdentifierTaken, sanitize } from '../../services/users/users.service';
import { getCookieValue } from '../../utils/cookies';
import { DeliveryOrder, PublicUser, SessionInfo } from '../../types';

function setAuthCookie(res: Response, userId: string): void {
  res.cookie('userId', userId, {
    httpOnly: true,
    maxAge: 10 * 60 * 1000, // 10 minutes
    sameSite: 'strict'
  });
}

function requireNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function pickIdentifier(body: Record<string, unknown>): string | null {
  const raw = body.identifier ?? body.email ?? body.phone ?? body.login ?? body.name;
  return requireNonEmptyString(raw) ? raw.trim() : null;
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as Record<string, unknown>;
    const name = body.name;
    const password = body.password;
    const email = body.email;
    const phone = body.phone;
    const login = body.login;

    if (!requireNonEmptyString(name) || !requireNonEmptyString(password)) {
      res.status(400).json({ error: 'name and password are required' });
      return;
    }

    const idData = {
      email: requireNonEmptyString(email) ? email.trim() : undefined,
      phone: requireNonEmptyString(phone) ? phone.trim() : undefined,
      login: requireNonEmptyString(login) ? login.trim() : undefined
    };

    if (!idData.email && !idData.phone && !idData.login) {
      res.status(400).json({ error: 'Provide at least one of: email, phone, login' });
      return;
    }

    const taken = await isIdentifierTaken(idData);
    if (taken) {
      res.status(400).json({ error: 'Email/phone/login already in use' });
      return;
    }

    const publicUser = await createUser({
      name: name.trim(),
      password: password.trim(),
      email: idData.email,
      phone: idData.phone,
      login: idData.login
    });

    setAuthCookie(res, publicUser.id);

    const session = await buildSession(publicUser);
    res.status(201).json(session);
  } catch {
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as Record<string, unknown>;
    const identifier = pickIdentifier(body);
    const password = body.password;

    if (!identifier || !requireNonEmptyString(password)) {
      res.status(400).json({ error: 'identifier and password are required' });
      return;
    }

    const user = await findUserByIdentifierUnsafe(identifier);
    if (!user || user.password !== password.trim()) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    setAuthCookie(res, user.id);

    const publicUser = sanitize(user);
    const session = await buildSession(publicUser);
    res.json(session);
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  res.clearCookie('userId');
  res.json({ success: true });
}

async function buildSession(user: PublicUser): Promise<SessionInfo> {
  const basket = await buildBasketView(user.id);
  const deliveries = await getDeliveriesForUser(user.id);
  return { user, basket, deliveries };
}

export async function session(req: Request, res: Response): Promise<void> {
  try {
    const userId = getCookieValue(req, 'userId');
    if (!userId) {
      const empty: SessionInfo = { user: null, basket: null, deliveries: null };
      res.json(empty);
      return;
    }

    const userUnsafe = await getUserUnsafeById(userId);
    if (!userUnsafe) {
      res.clearCookie('userId');
      const empty: SessionInfo = { user: null, basket: null, deliveries: null };
      res.json(empty);
      return;
    }

    const publicUser = sanitize(userUnsafe);
    const sessionInfo = await buildSession(publicUser);
    res.json(sessionInfo);
  } catch {
    res.status(500).json({ error: 'Failed to load session' });
  }
}
