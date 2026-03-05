import express from 'express';
import cookieParser from 'cookie-parser';
import router from './router/router';

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api', router);

app.get('/', (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>L_Shop API</h1>
        <p>Теперь можно тестировать в консоли:</p>
        <script>
          fetch('/api/products').then(res => res.json()).then(console.log);
        </script>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});