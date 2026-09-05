import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';
import { validateBody, validateQuery } from '../middlewares/validate.middleware';
import { CreateUserSchema, CreateStoreSchema, QueryFilterSchema } from '../validators';

const router = Router();

// Protect all admin routes with JWT Auth + Admin Role Check
router.use(authenticateJwt, requireAdmin);

// GET /api/admin/dashboard - System statistics
router.get('/dashboard', AdminController.getDashboardStats);

// POST /api/admin/users - Add new user (Admin, Normal User, Store Owner)
router.post('/users', validateBody(CreateUserSchema), AdminController.createUser);

// GET /api/admin/users - List users with filters, sorting, and store owner ratings
router.get('/users', validateQuery(QueryFilterSchema), AdminController.getUsers);

// POST /api/admin/stores - Add new store
router.post('/stores', validateBody(CreateStoreSchema), AdminController.createStore);

// GET /api/admin/stores - List stores with ratings, search, and sorting
router.get('/stores', validateQuery(QueryFilterSchema), AdminController.getStores);

export default router;
