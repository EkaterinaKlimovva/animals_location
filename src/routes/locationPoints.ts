import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { optionalAuthMiddleware } from '../middleware/optionalAuth';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  getLocationPoint,
  createLocationPoint,
  updateLocationPoint,
  deleteLocationPoint,
  getLocationPoints,
} from '../controllers/locationPointController';

const router = Router();

router.get('/', optionalAuthMiddleware, asyncHandler(getLocationPoints));
router.get('/:id', optionalAuthMiddleware, asyncHandler(getLocationPoint));
router.post('/', authMiddleware, asyncHandler(createLocationPoint));
router.put('/:id', authMiddleware, asyncHandler(updateLocationPoint));
router.delete('/:id', authMiddleware, asyncHandler(deleteLocationPoint));

export { router };

