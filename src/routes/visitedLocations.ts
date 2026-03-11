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
import { idSchema } from '../validation';
import { z } from 'zod';
import { optionalAuthMiddleware } from '../middleware/optionalAuth';

// Animal ID parameter schema for visited locations
export const animalIdParamSchema = z.object({
  animalId: idSchema,
});

// Visited location ID parameter schema
export const visitedLocationIdParamSchema = z.object({
  id: idSchema,
});

const router = Router({ mergeParams: true });

router.get('/', validateParams(animalIdParamSchema, 'params'), optionalAuthMiddleware, asyncHandler(listVisitedLocations));
router.post('/', validateParams(animalIdParamSchema, 'params'), authMiddleware, asyncHandler(createVisitedLocation));
router.put('/:id', validateParams(visitedLocationIdParamSchema, 'params'), authMiddleware, asyncHandler(updateVisitedLocation));
router.delete('/:id', validateParams(visitedLocationIdParamSchema, 'params'), authMiddleware, asyncHandler(deleteVisitedLocation));

export { router };

