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
  changeAnimalType,
} from '../controllers/animalController';
import { animalIdParamSchema, createAnimalSchema, updateAnimalSchema, addAnimalTypeSchema, removeAnimalTypeSchema, changeAnimalTypeSchema, changeAnimalTypeParamsSchema } from '../validation/animalSchemas';
import { optionalAuthMiddleware } from '../middleware/optionalAuth';

const router = Router();

router.get('/search', optionalAuthMiddleware, asyncHandler(searchAnimals));
router.get('/:id', optionalAuthMiddleware, validateParams(animalIdParamSchema, 'params'), asyncHandler(getAnimal));
router.post('/', authMiddleware, validateParams(createAnimalSchema, 'body'), asyncHandler(createAnimal));
router.put('/:id', authMiddleware, validateComposite(animalIdParamSchema, updateAnimalSchema), asyncHandler(updateAnimal));
router.delete('/:id', authMiddleware, validateParams(animalIdParamSchema, 'params'), asyncHandler(deleteAnimal));
router.post('/:id/types', authMiddleware, validateComposite(animalIdParamSchema, addAnimalTypeSchema), asyncHandler(addAnimalType));
router.post('/:id/types/:typeId', authMiddleware, validateParams(animalIdParamSchema, 'params'), asyncHandler(addAnimalType));
router.delete('/:id/types/:typeId', authMiddleware, validateParams(removeAnimalTypeSchema, 'params'), asyncHandler(removeAnimalType));
router.put('/:id/types', authMiddleware, validateParams(changeAnimalTypeParamsSchema, 'params'), validateParams(changeAnimalTypeSchema, 'body'), asyncHandler(changeAnimalType));

export { router };
