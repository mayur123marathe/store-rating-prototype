import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import storeRoutes from './store.routes';
import ratingRoutes from './rating.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Roxiler Store Rating Platform API',
  });
});

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/stores', storeRoutes);
router.use('/ratings', ratingRoutes);

export default router;
