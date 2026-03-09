import { Router } from 'express';
import { register, login, logout, session } from '../controllers/users/users.controller';
import { getProductsHandler, getProductByIdHandler, createProductHandler } from '../controllers/products/products.controller';
import { getBasketHandler, addToBasketHandler, updateBasketHandler, removeFromBasketHandler } from '../controllers/basket/basket.controller';
import { createDeliveryHandler, getDeliveryListHandler } from '../controllers/delivery/delivery.controller';

const router = Router();

// session
router.get('/session', session);

// auth
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// products
router.get('/products', getProductsHandler);
router.get('/products/:id', getProductByIdHandler);
router.post('/products', createProductHandler); // optional admin endpoint

// basket (only for logged-in)
router.get('/basket', getBasketHandler);
router.post('/basket/add', addToBasketHandler);
router.put('/basket/update', updateBasketHandler);
router.delete('/basket/remove/:productId', removeFromBasketHandler);

// delivery (only for logged-in)
router.get('/delivery', getDeliveryListHandler);
router.post('/delivery', createDeliveryHandler);

export default router;
