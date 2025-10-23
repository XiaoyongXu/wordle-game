import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3001;

app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Hello from the API!' });
});

app.listen(port, () => {
  console.log(`[api]: Server is running at http://localhost:${port}`);
});