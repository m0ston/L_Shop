const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000/api';

export class ApiError extends Error {
  public status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    credentials: 'include'
  });

  if (!res.ok) {
    const data = await parseJsonSafe(res);
    const msg = (typeof data === 'object' && data && 'error' in data && typeof (data as Record<string, unknown>).error === 'string')
      ? (data as Record<string, unknown>).error as string
      : `HTTP ${res.status}`;
    throw new ApiError(msg, res.status);
  }

  const json = await res.json() as T;
  return json;
}

export function toQuery(params: Record<string, string | number | boolean | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}
