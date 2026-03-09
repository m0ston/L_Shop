import { promises as fs } from 'fs';
import path from 'path';
import { PublicUser, User } from '../../types';

const usersFilePath = path.join(__dirname, '../../../database/users.json');

function nowIso(): string {
  return new Date().toISOString();
}

function sanitize(user: User): PublicUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...rest } = user;
  return rest;
}

async function readFileSafe(): Promise<string | null> {
  try {
    return await fs.readFile(usersFilePath, 'utf-8');
  } catch {
    return null;
  }
}

export async function readUsers(): Promise<User[]> {
  const text = await readFileSafe();
  if (!text) return [];
  const raw: unknown = JSON.parse(text);
  if (!Array.isArray(raw)) return [];
  return raw as User[];
}

export async function writeUsers(users: User[]): Promise<void> {
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
}

export async function findUserByIdentifier(identifier: string): Promise<User | undefined> {
  const users = await readUsers();
  const idLower = identifier.trim().toLowerCase();
  return users.find(u =>
    u.email?.toLowerCase() === idLower ||
    u.phone?.toLowerCase() === idLower ||
    u.login?.toLowerCase() === idLower ||
    u.name.toLowerCase() === idLower
  );
}

export async function isIdentifierTaken(data: { email?: string; phone?: string; login?: string }): Promise<boolean> {
  const users = await readUsers();
  const email = data.email?.trim().toLowerCase();
  const phone = data.phone?.trim().toLowerCase();
  const login = data.login?.trim().toLowerCase();

  return users.some(u =>
    (email && u.email?.toLowerCase() === email) ||
    (phone && u.phone?.toLowerCase() === phone) ||
    (login && u.login?.toLowerCase() === login)
  );
}

export async function createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<PublicUser> {
  const users = await readUsers();
  const newUser: User = {
    id: Date.now().toString(),
    createdAt: nowIso(),
    ...userData
  };
  users.push(newUser);
  await writeUsers(users);
  return sanitize(newUser);
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  const users = await readUsers();
  const found = users.find(u => u.id === id);
  if (!found) return null;
  return sanitize(found);
}

export async function getUserUnsafeById(id: string): Promise<User | null> {
  const users = await readUsers();
  return users.find(u => u.id === id) ?? null;
}

export { sanitize };

export async function findUserByIdentifierUnsafe(identifier: string): Promise<User | undefined> {
  return await findUserByIdentifier(identifier);
}
