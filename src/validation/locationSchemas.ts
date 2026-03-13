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

// Add location to animal schema
export const addLocationToAnimalSchema = z.object({
  pointId: idSchema,
});

// Update visited location schema
export const updateVisitedLocationSchema = z.object({
  visitedLocationPointId: z.number().positive('VisitedLocationPointId must be positive'),
  locationPointId: z.number().positive('LocationPointId must be positive'),
});

// Remove visited location schema
export const removeVisitedLocationSchema = z.object({
  visitedPointId: z.number().positive('VisitedPointId must be positive'),
});

// Search visited locations schema
export const searchVisitedLocationsSchema = z.object({
  startDateTime: z.string().optional().refine((val) => {
    if (!val) return true;
    return !isNaN(Date.parse(val));
  }, {
    message: 'startDateTime must be in ISO-8601 format',
  }),
  endDateTime: z.string().optional().refine((val) => {
    if (!val) return true;
    return !isNaN(Date.parse(val));
  }, {
    message: 'endDateTime must be in ISO-8601 format',
  }),
  from: z.string().optional().transform((val) => val ? Number(val) : 0),
  size: z.string().optional().transform((val) => val ? Number(val) : 10),
}).refine((data) => {
  return Number.isInteger(data.from) && data.from >= 0 &&
         Number.isInteger(data.size) && data.size > 0;
}, {
  message: 'from must be >= 0, size must be > 0',
});

export type CreateLocationPointInput = z.infer<typeof createLocationPointSchema>;
export type UpdateLocationPointInput = z.infer<typeof updateLocationPointSchema>;
export type LocationPointIdInput = z.infer<typeof locationPointIdSchema>;
