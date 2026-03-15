import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateParams, validateComposite } from '../middleware/validateParams';
import {
  listVisitedLocations,
  createVisitedLocation,
  updateVisitedLocation,
  deleteVisitedLocation,
} from '../controllers/animalVisitedLocationController';
import { animalIdParamSchema, visitedLocationIdParamSchema, updateVisitedLocationBodySchema } from '../validation/visitedLocationSchemas';
import { optionalAuthMiddleware } from '../middleware/optionalAuth';

const router = Router({ mergeParams: true });

router.get('/', validateParams(animalIdParamSchema, 'params'), optionalAuthMiddleware, asyncHandler(listVisitedLocations));
router.post('/:id', authMiddleware, validateParams(animalIdParamSchema, 'params'), asyncHandler(createVisitedLocation));
router.put('/', authMiddleware, validateComposite(animalIdParamSchema, updateVisitedLocationBodySchema), asyncHandler(updateVisitedLocation));
router.delete('/:id', authMiddleware, validateParams(visitedLocationIdParamSchema, 'params'), asyncHandler(deleteVisitedLocation));

export { router };

