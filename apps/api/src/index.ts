import express, { Request, Response } from 'express';
import { errorHandler } from './middlewares/errorHandler';
import wordleRoutes from './routes/wordleRoutes';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from API!');
});

app.use('/games', wordleRoutes)

// Middleware for error handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`[api]: Server is running at http://localhost:${port}`);
});