import { Request } from 'express';

export function getCookieValue(req: Request, name: string): string | null {
  const raw: unknown = (req as unknown as { cookies?: unknown }).cookies;
  if (!raw || typeof raw !== 'object') return null;
  const dict = raw as Record<string, unknown>;
  const val = dict[name];
  return typeof val === 'string' ? val : null;
}

