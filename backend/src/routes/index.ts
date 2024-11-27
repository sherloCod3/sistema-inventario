// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth';
import inventoryRouter from './inventory';

const router = Router();

router.use('/auth', authRoutes);
router.use('/inventory', inventoryRouter);

export default router;