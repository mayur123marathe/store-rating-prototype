import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { swaggerSpec } from './docs/swagger';
import { ENV } from './config/env';

export const createApp = (): Application => {
  const app = express();

  // Security & Utility Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Allows Swagger UI to load resources smoothly
  }));
  app.use(cors({
    origin: '*',
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (ENV.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Swagger UI API Documentation endpoint
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Roxiler Rating Platform API Docs',
  }));

  // Root endpoint
  app.get('/', (_req, res) => {
    res.status(200).json({
      status: 'online',
      service: 'Roxiler Store Rating Platform Backend API',
      health: '/api/health',
      docs: '/api/docs',
    });
  });

  // Application Routes
  app.use('/api', routes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
