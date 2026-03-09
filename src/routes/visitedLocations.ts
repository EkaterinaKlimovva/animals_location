import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  listVisitedLocations,
  createVisitedLocation,
  updateVisitedLocation,
  deleteVisitedLocation,
} from '../controllers/animalVisitedLocationController';

const router = Router();

router.get('/animal/:animalId', asyncHandler(listVisitedLocations));
router.post('/animal/:animalId', authMiddleware, asyncHandler(createVisitedLocation));
router.put('/:id', authMiddleware, asyncHandler(updateVisitedLocation));
router.delete('/:id', authMiddleware, asyncHandler(deleteVisitedLocation));

export { router };

