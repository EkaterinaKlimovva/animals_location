import { idSchema } from './commonSchemas';
import { z } from 'zod';

// Animal ID parameter schema for visited locations
export const animalIdParamSchema = z.object({
  animalId: idSchema,
});

// Visited location ID parameter schema
export const visitedLocationIdParamSchema = z.object({
  id: idSchema,
});

// Update visited location body schema
export const updateVisitedLocationBodySchema = z.object({
  visitedLocationPointId: idSchema,
  locationPointId: idSchema,
});
