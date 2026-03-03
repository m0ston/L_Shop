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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});