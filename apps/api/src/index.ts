import express, { Request, Response } from 'express';
import { errorHandler } from './middlewares/errorHandler';
import wordleRoutes from './routes/wordleRoutes';
import multiplayerRoutes from './routes/multiplayerRoutes';
import cors from 'cors';
import { initializeWebSocket } from './websocketService';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from API!');
});

app.use('/games', wordleRoutes)
app.use('/multiplayer', multiplayerRoutes)

// Middleware for error handling
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`[api]: Server is running at http://localhost:${port}`);
});

// Initialize the WebSocket server
initializeWebSocket(server);