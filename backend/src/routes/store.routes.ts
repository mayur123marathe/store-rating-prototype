import { Router } from 'express';
import { StoreController } from '../controllers/store.controller';
import { authenticateJwt, optionalAuth } from '../middlewares/auth.middleware';
import { requireStoreOwner } from '../middlewares/role.middleware';
import { validateQuery } from '../middlewares/validate.middleware';
import { QueryFilterSchema } from '../validators';

const router = Router();

// GET /api/stores - Public / Normal User store listing with user's submitted rating
router.get('/', optionalAuth, validateQuery(QueryFilterSchema), StoreController.getStoresForUser);

// GET /api/stores/owner/dashboard - Store Owner dashboard with reviewers table and stats
router.get(
  '/owner/dashboard',
  authenticateJwt,
  requireStoreOwner,
  validateQuery(QueryFilterSchema),
  StoreController.getStoreOwnerDashboard
);

export default router;
