import { promises as fs } from 'fs';
import path from 'path';
import { User } from '../../types';

const usersFilePath = path.join(__dirname, '../../../database/users.json');

// чтение пользователей из файла
export async function readUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// запись пользователей в файл
export async function writeUsers(users: User[]): Promise<void> {
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
}

// поиск пользователя по email
export async function findUserByEmail(email: string): Promise<User | undefined> {
  const users = await readUsers();
  return users.find(user => user.email === email);
}

// создание нового пользователя
export async function createUser(userData: Omit<User, 'id'>): Promise<User> {
  const users = await readUsers();
  const newUser = {
    id: Date.now().toString(),
    ...userData
  };
  users.push(newUser);
  await writeUsers(users);
  return newUser;
}