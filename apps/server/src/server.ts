import { createApp } from '@/app';
import { connectDatabase } from '@/config/mongodb';
import { env } from '@/config/env';

async function bootstrap(): Promise<void> {
  // Connect to DB before starting HTTP server
  await connectDatabase();

  const app = createApp();

  const server = app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port} [${env.node_env}]`);
  });

  // Graceful Shutdown 
  const shutdown = (signal: string) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      const { disconnectDatabase } = await import('@/config/mongodb');
      await disconnectDatabase();
      console.log('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION:', reason);
    server.close(() => process.exit(1));
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
