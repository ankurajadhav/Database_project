/**
 * Express Application Instance
 */
import express from 'express';
import { apiRouter } from './routes.ts';

export const app = express();
app.use(express.json());
app.use('/api', apiRouter);

// Fallback error handler
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  res.status(500).json({ error: message });
});
