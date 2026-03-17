import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateParams } from '../middleware/validateParams';
import {
  listVisitedLocations,
  createVisitedLocation,
  updateVisitedLocation,
  deleteVisitedLocation,
} from '../controllers/animalVisitedLocationController';
import { animalIdParamSchema, locationPointIdParamSchema, updateVisitedLocationBodySchema, createVisitedLocationBodySchema } from '../validation/visitedLocationSchemas';
import { optionalAuthMiddleware } from '../middleware/optionalAuth';

const router = Router({ mergeParams: true });

router.get('/', validateParams(animalIdParamSchema, 'params'), optionalAuthMiddleware, asyncHandler(listVisitedLocations));
router.post('/:locationId', validateParams(animalIdParamSchema, 'params'), validateParams(locationPointIdParamSchema, 'params'), validateParams(createVisitedLocationBodySchema, 'body'), authMiddleware, asyncHandler(createVisitedLocation));
router.put('/', validateParams(animalIdParamSchema, 'params'), validateParams(updateVisitedLocationBodySchema, 'body'), authMiddleware, asyncHandler(updateVisitedLocation));
router.delete('/:locationId', validateParams(animalIdParamSchema, 'params'), validateParams(locationPointIdParamSchema, 'params'), authMiddleware, asyncHandler(deleteVisitedLocation));

export { router };

