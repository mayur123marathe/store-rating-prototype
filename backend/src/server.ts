import app from './app';
import { ENV } from './config/env';
import { prisma } from './config/prisma';

const startServer = async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ PostgreSQL Database connected successfully via Prisma');

    const server = app.listen(ENV.PORT, () => {
      console.log(`🚀 Server running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
      console.log(`📖 Swagger API Documentation available at http://localhost:${ENV.PORT}/api/docs`);
      console.log(`❤️  Health check available at http://localhost:${ENV.PORT}/api/health`);
    });

    const shutdown = async () => {
      console.log('Stopping server gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('Prisma disconnected, server shut down cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
