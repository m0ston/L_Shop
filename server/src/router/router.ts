import { Router } from 'express';
import { register, login, logout } from '../controllers/users/users.controller';

const router = Router();

// Users
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Basket
// ------

export default router;