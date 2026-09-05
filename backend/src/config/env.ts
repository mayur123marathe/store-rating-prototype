import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/roxiler_db?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'supersecretjwtkey_roxiler_system_2026_secure_token',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
