import express from 'express';
import { getDashboardStats, getStorageInfo } from '../controllers/analytics.controller.js';

const router = express.Router();

router.get('/dashboard', getDashboardStats);
router.get('/storage', getStorageInfo);

export default router;
