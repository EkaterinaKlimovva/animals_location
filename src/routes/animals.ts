import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateParams, validateComposite } from '../middleware/validateParams';
import {
  getAnimal,
  searchAnimals,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  addAnimalType,
  removeAnimalType,
} from '../controllers/animalController';
import { animalIdParamSchema, createAnimalSchema, updateAnimalSchema, addAnimalTypeSchema, removeAnimalTypeSchema } from '../validation/animalSchemas';
import { optionalAuthMiddleware } from '../middleware/optionalAuth';

const router = Router();

router.get('/search', optionalAuthMiddleware, asyncHandler(searchAnimals));
router.get('/:id', authMiddleware, validateParams(animalIdParamSchema, 'params'), asyncHandler(getAnimal));
router.post('/', authMiddleware, validateParams(createAnimalSchema, 'body'), asyncHandler(createAnimal));
router.put('/:id', validateComposite(animalIdParamSchema, updateAnimalSchema), authMiddleware, asyncHandler(updateAnimal));
router.delete('/:id', validateParams(animalIdParamSchema, 'params'), authMiddleware, asyncHandler(deleteAnimal));
router.post('/:id/types', validateComposite(animalIdParamSchema, addAnimalTypeSchema), authMiddleware, asyncHandler(addAnimalType));
router.delete('/:id/types/:typeId', validateParams(removeAnimalTypeSchema, 'params'), authMiddleware, asyncHandler(removeAnimalType));

export { router };
