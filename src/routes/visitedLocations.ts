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
import { animalIdParamSchema, visitedPointIdParamSchema, locationPointIdParamSchema, updateVisitedLocationBodySchema, createVisitedLocationBodySchema } from '../validation/visitedLocationSchemas';
import { optionalAuthMiddleware } from '../middleware/optionalAuth';

const router = Router({ mergeParams: true });

router.get('/', validateParams(animalIdParamSchema, 'params'), optionalAuthMiddleware, asyncHandler(listVisitedLocations));
router.post('/:locationId', authMiddleware, validateParams(animalIdParamSchema, 'params'), validateParams(locationPointIdParamSchema, 'params'), validateParams(createVisitedLocationBodySchema, 'body'), asyncHandler(createVisitedLocation));
router.put('/', authMiddleware, validateParams(animalIdParamSchema, 'params'), validateParams(updateVisitedLocationBodySchema, 'body'), asyncHandler(updateVisitedLocation));
router.delete('/:locationId', authMiddleware, validateParams(animalIdParamSchema, 'params'), validateParams(locationPointIdParamSchema, 'params'), asyncHandler(deleteVisitedLocation));

export { router };

