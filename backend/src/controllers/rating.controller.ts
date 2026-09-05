import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/errors';
import { Role } from '@prisma/client';

export class RatingController {
  /**
   * Submit or modify a rating (1 to 5) for a store by a Normal User
   */
  static async submitOrUpdateRating(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId) {
        throw ApiError.unauthorized();
      }

      if (userRole !== Role.USER) {
        throw ApiError.forbidden('Only normal users are allowed to submit store ratings');
      }

      const { storeId, score } = req.body;

      // Check if store exists
      const store = await prisma.store.findUnique({
        where: { id: storeId },
      });

      if (!store) {
        throw ApiError.notFound('Store not found');
      }

      // Upsert rating (if exists -> update score, else -> create new)
      const rating = await prisma.rating.upsert({
        where: {
          userId_storeId: {
            userId,
            storeId,
          },
        },
        update: {
          score,
        },
        create: {
          userId,
          storeId,
          score,
        },
      });

      // Recalculate store average rating
      const storeRatings = await prisma.rating.findMany({
        where: { storeId },
        select: { score: true },
      });

      const totalCount = storeRatings.length;
      const sum = storeRatings.reduce((acc, r) => acc + r.score, 0);
      const newAverage = Number((sum / totalCount).toFixed(2));

      return res.status(200).json({
        success: true,
        message: 'Rating submitted successfully',
        data: {
          rating,
          storeOverallRating: newAverage,
          storeRatingCount: totalCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's rating for a specific store
   */
  static async getUserRatingForStore(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const storeId = req.params.storeId as string;

      if (!userId) {
        return res.status(200).json({
          success: true,
          data: { rating: null },
        });
      }

      const rating = await prisma.rating.findUnique({
        where: {
          userId_storeId: {
            userId,
            storeId,
          },
        },
      });

      return res.status(200).json({
        success: true,
        data: {
          rating: rating ? rating.score : null,
          ratingId: rating ? rating.id : null,
          updatedAt: rating ? rating.updatedAt : null,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
