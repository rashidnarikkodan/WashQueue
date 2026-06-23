import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { errorHandler } from './shared/middlewares/errorHandler';
import { notFound } from './shared/middlewares/notFound';
import authRoutes from './modules/auth/presentation/routes/auth.routes';

export function createApp(): Application {
  const app = express();

  // Security Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
      credentials: true,
    }),
  );

  // Body Parsing 
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Health Check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Routes 
  app.use('/api/auth', authRoutes);

  // Error Handling (must be last)
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
