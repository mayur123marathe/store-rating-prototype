import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { SignupSchema, LoginSchema, ChangePasswordSchema } from '../validators';
import { authenticateJwt } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/auth/signup - Normal User signup
router.post('/signup', validateBody(SignupSchema), AuthController.signup);

// POST /api/auth/login - Unified login for all roles
router.post('/login', validateBody(LoginSchema), AuthController.login);

// POST /api/auth/change-password - Change password for authenticated user
router.post(
  '/change-password',
  authenticateJwt,
  validateBody(ChangePasswordSchema),
  AuthController.changePassword
);

// GET /api/auth/me - Current user details
router.get('/me', authenticateJwt, AuthController.getMe);

export default router;
