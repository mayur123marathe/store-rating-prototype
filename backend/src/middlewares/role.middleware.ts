import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ApiError } from '../utils/errors';

export const requireRoles = (allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`
        )
      );
    }

    next();
  };
};

export const requireAdmin = requireRoles(['ADMIN']);
export const requireStoreOwner = requireRoles(['STORE_OWNER']);
export const requireNormalUser = requireRoles(['USER']);
