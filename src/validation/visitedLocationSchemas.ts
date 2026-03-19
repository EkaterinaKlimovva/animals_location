import { idSchema } from './commonSchemas';
import { z } from 'zod';

// Animal ID parameter schema for visited locations
export const animalIdParamSchema = z.object({
  animalId: idSchema,
});

// Location point ID parameter schema for POST endpoint
export const locationPointIdParamSchema = z.object({
  locationId: idSchema,
});

// Update visited location body schema
export const updateVisitedLocationBodySchema = z.object({
  visitedLocationPointId: idSchema,
  locationPointId: idSchema.optional(),
  visitedAt: z.string().datetime().optional(),
});

// Create visited location body schema
export const createVisitedLocationBodySchema = z.object({
  visitedAt: z.string().datetime().optional(),
});
