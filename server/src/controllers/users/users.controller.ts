import { Request, Response } from 'express';
import { findUserByEmail, createUser } from '../../services/users/users.service';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, name, phone } = req.body;
    
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // создание пользователя
    const newUser = await createUser({ email, password, name, phone });
    
    res.cookie('userId', newUser.id, {
      httpOnly: true,
      maxAge: 10 * 60 * 1000,
      sameSite: 'strict'
    });
    
    res.status(201).json({ user: newUser });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    
    const user = await findUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.cookie('userId', user.id, {
      httpOnly: true,
      maxAge: 10 * 60 * 1000,
      sameSite: 'strict'
    });
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie('userId');
  res.json({ success: true });
}