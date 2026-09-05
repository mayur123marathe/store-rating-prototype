import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/errors';
import { Role, Prisma } from '@prisma/client';

export class AdminController {
  /**
   * System Admin Dashboard: Total users, total stores, total ratings, rating breakdown
   */
  static async getDashboardStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const [totalUsers, totalStores, totalRatings, ratingsAgg] = await Promise.all([
        prisma.user.count(),
        prisma.store.count(),
        prisma.rating.count(),
        prisma.rating.aggregate({
          _avg: { score: true },
        }),
      ]);

      // Role distribution
      const [adminCount, userCount, storeOwnerCount] = await Promise.all([
        prisma.user.count({ where: { role: Role.ADMIN } }),
        prisma.user.count({ where: { role: Role.USER } }),
        prisma.user.count({ where: { role: Role.STORE_OWNER } }),
      ]);

      // Rating score breakdown (1 to 5)
      const scoreDistribution = await prisma.rating.groupBy({
        by: ['score'],
        _count: { score: true },
      });

      const distributionMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      scoreDistribution.forEach((item) => {
        distributionMap[item.score] = item._count.score;
      });

      return res.status(200).json({
        success: true,
        data: {
          totalUsers,
          totalStores,
          totalRatings,
          averagePlatformRating: ratingsAgg._avg.score ? Number(ratingsAgg._avg.score.toFixed(2)) : 0,
          roleStats: {
            admin: adminCount,
            user: userCount,
            storeOwner: storeOwnerCount,
          },
          scoreDistribution: distributionMap,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin creates a new user (Admin, Normal User, or Store Owner)
   */
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, address, role } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        throw ApiError.conflict('User with this email already exists');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          address,
          role: role as Role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          role: true,
          createdAt: true,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin lists all users with filters (Name, Email, Address, Role) and sorting
   * If user is STORE_OWNER, includes their store's overall rating
   */
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, name, email, address, role, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query as any;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Build WHERE clause
      const where: Prisma.UserWhereInput = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (name) {
        where.name = { contains: name, mode: 'insensitive' };
      }

      if (email) {
        where.email = { contains: email, mode: 'insensitive' };
      }

      if (address) {
        where.address = { contains: address, mode: 'insensitive' };
      }

      if (role && role !== 'ALL') {
        where.role = role as Role;
      }

      // Fetch users with their stores and store ratings
      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          role: true,
          createdAt: true,
          stores: {
            select: {
              id: true,
              name: true,
              ratings: {
                select: {
                  score: true,
                },
              },
            },
          },
        },
      });

      // Calculate store rating for each user if they are a STORE_OWNER
      const processedUsers = users.map((u) => {
        let storeRating: number | null = null;
        let storeName: string | null = null;
        let totalStoreRatings = 0;

        if (u.role === Role.STORE_OWNER && u.stores.length > 0) {
          const store = u.stores[0];
          storeName = store.name;
          totalStoreRatings = store.ratings.length;
          if (totalStoreRatings > 0) {
            const sum = store.ratings.reduce((acc, r) => acc + r.score, 0);
            storeRating = Number((sum / totalStoreRatings).toFixed(2));
          } else {
            storeRating = 0;
          }
        }

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          address: u.address,
          role: u.role,
          createdAt: u.createdAt,
          storeName,
          storeRating,
          totalStoreRatings,
        };
      });

      // Sort in-memory to handle computed storeRating and dynamic fields cleanly
      const order = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
      processedUsers.sort((a: any, b: any) => {
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

      const total = processedUsers.length;
      const paginatedUsers = processedUsers.slice(skip, skip + take);

      return res.status(200).json({
        success: true,
        data: {
          users: paginatedUsers,
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
   * Admin creates a new Store
   */
  static async createStore(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, address, ownerId } = req.body;

      const existingStore = await prisma.store.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingStore) {
        throw ApiError.conflict('A store with this email already exists');
      }

      if (ownerId) {
        const owner = await prisma.user.findUnique({
          where: { id: ownerId },
        });

        if (!owner) {
          throw ApiError.notFound('Designated store owner not found');
        }
        if (owner.role !== Role.STORE_OWNER) {
          // Auto upgrade or ensure role is STORE_OWNER
          await prisma.user.update({
            where: { id: ownerId },
            data: { role: Role.STORE_OWNER },
          });
        }
      }

      const store = await prisma.store.create({
        data: {
          name,
          email: email.toLowerCase(),
          address,
          ownerId: ownerId || null,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Store created successfully',
        data: store,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin lists all stores with overall ratings, search & sorting
   */
  static async getStores(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, name, email, address, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query as any;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: Prisma.StoreWhereInput = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (name) {
        where.name = { contains: name, mode: 'insensitive' };
      }
      if (email) {
        where.email = { contains: email, mode: 'insensitive' };
      }
      if (address) {
        where.address = { contains: address, mode: 'insensitive' };
      }

      const stores = await prisma.store.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          ratings: {
            select: {
              score: true,
            },
          },
        },
      });

      // Calculate rating summary for each store
      const processedStores = stores.map((s) => {
        const ratingCount = s.ratings.length;
        const totalScore = s.ratings.reduce((acc, r) => acc + r.score, 0);
        const overallRating = ratingCount > 0 ? Number((totalScore / ratingCount).toFixed(2)) : 0;

        return {
          id: s.id,
          name: s.name,
          email: s.email,
          address: s.address,
          owner: s.owner,
          overallRating,
          ratingCount,
          createdAt: s.createdAt,
        };
      });

      // Sort
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
}
