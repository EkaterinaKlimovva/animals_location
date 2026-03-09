import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  getAnimalType,
  createAnimalType,
  updateAnimalType,
  deleteAnimalType,
} from '../controllers/animalTypeController';

const router = Router();

router.get('/:id', asyncHandler(getAnimalType));
router.post('/', authMiddleware, asyncHandler(createAnimalType));
router.put('/:id', authMiddleware, asyncHandler(updateAnimalType));
router.delete('/:id', authMiddleware, asyncHandler(deleteAnimalType));

export { router };

