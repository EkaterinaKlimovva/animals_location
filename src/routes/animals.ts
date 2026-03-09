import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  getAnimal,
  searchAnimals,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  addAnimalType,
  removeAnimalType,
} from '../controllers/animalController';

const router = Router();

router.get('/search', asyncHandler(searchAnimals));
router.get('/:id', asyncHandler(getAnimal));
router.post('/', authMiddleware, asyncHandler(createAnimal));
router.put('/:id', authMiddleware, asyncHandler(updateAnimal));
router.delete('/:id', authMiddleware, asyncHandler(deleteAnimal));
router.post('/:id/types', authMiddleware, asyncHandler(addAnimalType));
router.delete('/:id/types/:typeId', authMiddleware, asyncHandler(removeAnimalType));

export { router };
