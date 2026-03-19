import { z } from 'zod';
import { idSchema } from './commonSchemas';

// Create location point schema
export const createLocationPointSchema = z.object({
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
});

// Update location point schema (all fields optional with null transformation)
export const updateLocationPointSchema = z.object({
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90').optional(),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180').optional(),
});

// Location point ID schema (long ID)
export const locationPointIdSchema = z.object({
  id: idSchema,
});

export type CreateLocationPointInput = z.infer<typeof createLocationPointSchema>;
export type UpdateLocationPointInput = z.infer<typeof updateLocationPointSchema>;
export type LocationPointIdInput = z.infer<typeof locationPointIdSchema>;
