import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Custom ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || undefined,
    });
  }

  // Prisma unique constraint violation (P2002)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || [];
      const fieldName = target.join(', ') || 'field';
      return res.status(409).json({
        success: false,
        message: `A record with this ${fieldName} already exists.`,
      });
    }
  }

  console.error('Unhandled Server Error:', err);

  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Internal server error',
  });
};
