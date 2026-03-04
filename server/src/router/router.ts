import { Router } from 'express';
import { register, login, logout } from '../controllers/users/users.controller';
import { getProductsHandler, getProductByIdHandler, createProductHandler } from '../controllers/products/products.controller';
import {
  getBasketHandler,
  addToBasketHandler,
  updateBasketHandler,
  removeFromBasketHandler,
  clearBasketHandler
} from '../controllers/basket/basket.controller';

const router = Router();

// Users
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Products
router.get('/products', getProductsHandler);
router.get('/products/:id', getProductByIdHandler);
router.post('/products', createProductHandler); // опционально

// Basket
router.get('/basket', getBasketHandler);
router.post('/basket/add', addToBasketHandler);
router.put('/basket/update', updateBasketHandler);
router.delete('/basket/remove/:productId', removeFromBasketHandler);
router.post('/basket/clear', clearBasketHandler);

export default router;