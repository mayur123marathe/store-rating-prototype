import { Router } from 'express';
import { RatingController } from '../controllers/rating.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { requireNormalUser } from '../middlewares/role.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { SubmitRatingSchema } from '../validators';

const router = Router();

// POST /api/ratings - Submit or update 1-5 rating (Normal user only)
router.post(
  '/',
  authenticateJwt,
  requireNormalUser,
  validateBody(SubmitRatingSchema),
  RatingController.submitOrUpdateRating
);

// GET /api/ratings/store/:storeId - Get logged in user's rating for store
router.get('/store/:storeId', authenticateJwt, RatingController.getUserRatingForStore);

export default router;
