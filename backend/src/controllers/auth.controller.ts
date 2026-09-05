import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { ENV } from '../config/env';
import { ApiError } from '../utils/errors';
import { Role } from '@prisma/client';

export class AuthController {
  /**
   * User Signup (Normal User only)
   */
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, address } = req.body;

      // Check if email already registered
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        throw ApiError.conflict('An account with this email address already exists');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create normal user
      const user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          address,
          role: Role.USER,
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

      // Generate JWT Token
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        ENV.JWT_SECRET,
        { expiresIn: ENV.JWT_EXPIRES_IN as any }
      );

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Single Unified Login for all roles
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          stores: {
            select: {
              id: true,
              name: true,
              email: true,
              address: true,
            },
          },
        },
      });

      if (!user) {
        throw ApiError.unauthorized('Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw ApiError.unauthorized('Invalid email or password');
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        ENV.JWT_SECRET,
        { expiresIn: ENV.JWT_EXPIRES_IN as any }
      );

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            role: user.role,
            store: user.stores && user.stores.length > 0 ? user.stores[0] : null,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update password for logged in user (Admin, Store Owner, Normal User)
   */
  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized();
      }

      const { currentPassword, newPassword } = req.body;

      if (currentPassword === newPassword) {
        throw ApiError.badRequest('New password must be different from current password');
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw ApiError.notFound('User not found');
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw ApiError.badRequest('Incorrect current password');
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return res.status(200).json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Current Authenticated User Profile
   */
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized();
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
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
              email: true,
              address: true,
            },
          },
        },
      });

      if (!user) {
        throw ApiError.notFound('User not found');
      }

      return res.status(200).json({
        success: true,
        data: {
          ...user,
          store: user.stores && user.stores.length > 0 ? user.stores[0] : null,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
