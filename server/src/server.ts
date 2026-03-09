import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import router from './router/router';

const app = express();
const port = 3000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes


app.use('/api', router);

app.get('/', (_req, res) => {
  res.type('text').send('L_Shop API is running. Use /api/products, /api/session, etc.');
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${port}`);
});