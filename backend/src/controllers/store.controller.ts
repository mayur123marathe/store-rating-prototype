import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/errors';
import { Prisma } from '@prisma/client';

export class StoreController {
  /**
   * Normal User / Public Store Listing
   * Includes overall rating, review count, and current user's submitted rating if authenticated
   */
  static async getStoresForUser(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUserId = req.user?.id;
      const { search, name, address, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query as any;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: Prisma.StoreWhereInput = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (name) {
        where.name = { contains: name, mode: 'insensitive' };
      }

      if (address) {
        where.address = { contains: address, mode: 'insensitive' };
      }

      const stores = await prisma.store.findMany({
        where,
        include: {
          ratings: {
            select: {
              id: true,
              score: true,
              userId: true,
              updatedAt: true,
            },
          },
        },
      });

      const processedStores = stores.map((store) => {
        const ratingCount = store.ratings.length;
        const totalScore = store.ratings.reduce((sum, r) => sum + r.score, 0);
        const overallRating = ratingCount > 0 ? Number((totalScore / ratingCount).toFixed(2)) : 0;

        // Find if current user submitted a rating
        const userRatingObj = currentUserId
          ? store.ratings.find((r) => r.userId === currentUserId)
          : null;

        return {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          overallRating,
          ratingCount,
          userRating: userRatingObj ? userRatingObj.score : null,
          userRatingId: userRatingObj ? userRatingObj.id : null,
          userRatedAt: userRatingObj ? userRatingObj.updatedAt : null,
          createdAt: store.createdAt,
        };
      });

      // Sorting
      const order = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
      processedStores.sort((a: any, b: any) => {
        let valA = a[sortBy] ?? '';
        let valB = b[sortBy] ?? '';

        if (typeof valA === 'string') {
          return valA.localeCompare(valB) * order;
        }
        if (typeof valA === 'number' || typeof valB === 'number') {
          return ((valA || 0) - (valB || 0)) * order;
        }
        if (valA instanceof Date) {
          return (new Date(valA).getTime() - new Date(valB).getTime()) * order;
        }
        return 0;
      });

      const total = processedStores.length;
      const paginatedStores = processedStores.slice(skip, skip + take);

      return res.status(200).json({
        success: true,
        data: {
          stores: paginatedStores,
          pagination: {
            total,
            page: Number(page),
            limit: take,
            totalPages: Math.ceil(total / take) || 1,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Store Owner Dashboard
   * View average rating of their store & list of users who submitted ratings for their store
   */
  static async getStoreOwnerDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user?.id;
      if (!ownerId) {
        throw ApiError.unauthorized();
      }

      const { search, name, email, address, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query as any;

      // Find store owned by this user
      const store = await prisma.store.findFirst({
        where: { ownerId },
        include: {
          ratings: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  address: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!store) {
        return res.status(200).json({
          success: true,
          data: {
            hasStore: false,
            message: 'No store currently assigned to this account. Please contact the administrator.',
          },
        });
      }

      // Calculate stats
      const totalRatings = store.ratings.length;
      const totalScore = store.ratings.reduce((sum, r) => sum + r.score, 0);
      const averageRating = totalRatings > 0 ? Number((totalScore / totalRatings).toFixed(2)) : 0;

      // Score distribution breakdown (5, 4, 3, 2, 1)
      const scoreDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      store.ratings.forEach((r) => {
        scoreDistribution[r.score] = (scoreDistribution[r.score] || 0) + 1;
      });

      // Prepare Reviewers list (users who rated this store)
      let reviewers = store.ratings.map((r) => ({
        ratingId: r.id,
        score: r.score,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        user: {
          id: r.user.id,
          name: r.user.name,
          email: r.user.email,
          address: r.user.address,
        },
      }));

      // Filter reviewers by search, name, email, address
      if (search) {
        const s = search.toLowerCase();
        reviewers = reviewers.filter(
          (r) =>
            r.user.name.toLowerCase().includes(s) ||
            r.user.email.toLowerCase().includes(s) ||
            r.user.address.toLowerCase().includes(s)
        );
      }
      if (name) {
        reviewers = reviewers.filter((r) => r.user.name.toLowerCase().includes(name.toLowerCase()));
      }
      if (email) {
        reviewers = reviewers.filter((r) => r.user.email.toLowerCase().includes(email.toLowerCase()));
      }
      if (address) {
        reviewers = reviewers.filter((r) => r.user.address.toLowerCase().includes(address.toLowerCase()));
      }

      // Sort reviewers
      const order = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
      reviewers.sort((a: any, b: any) => {
        let valA: any;
        let valB: any;

        if (sortBy === 'name') {
          valA = a.user.name;
          valB = b.user.name;
        } else if (sortBy === 'email') {
          valA = a.user.email;
          valB = b.user.email;
        } else if (sortBy === 'address') {
          valA = a.user.address;
          valB = b.user.address;
        } else if (sortBy === 'score' || sortBy === 'rating') {
          valA = a.score;
          valB = b.score;
        } else {
          valA = a.createdAt;
          valB = b.createdAt;
        }

        if (typeof valA === 'string') {
          return valA.localeCompare(valB) * order;
        }
        if (typeof valA === 'number') {
          return (valA - valB) * order;
        }
        if (valA instanceof Date) {
          return (new Date(valA).getTime() - new Date(valB).getTime()) * order;
        }
        return 0;
      });

      const total = reviewers.length;
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);
      const paginatedReviewers = reviewers.slice(skip, skip + take);

      return res.status(200).json({
        success: true,
        data: {
          hasStore: true,
          store: {
            id: store.id,
            name: store.name,
            email: store.email,
            address: store.address,
            averageRating,
            totalRatings,
            scoreDistribution,
          },
          reviewers: paginatedReviewers,
          pagination: {
            total,
            page: Number(page),
            limit: take,
            totalPages: Math.ceil(total / take) || 1,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
