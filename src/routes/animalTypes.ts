import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  getAnimalType,
  createAnimalType,
  updateAnimalType,
  deleteAnimalType,
} from '../controllers/animalTypeController';
import { optionalAuthMiddleware } from '../middleware/optionalAuth';

const router = Router();

router.get('/:id', optionalAuthMiddleware, asyncHandler(getAnimalType));
router.post('/', authMiddleware, asyncHandler(createAnimalType));
router.put('/:id', authMiddleware, asyncHandler(updateAnimalType));
router.delete('/:id', authMiddleware, asyncHandler(deleteAnimalType));

export { router };
