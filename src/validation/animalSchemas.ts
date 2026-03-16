import { z } from 'zod';
import { idSchema, isoDateTimeSchema, genderSchema, lifeStatusSchema } from './commonSchemas';

// Search animals schema with complete validation
export const searchAnimalsSchema = z.object({
  startDateTime: isoDateTimeSchema.optional(),
  endDateTime: isoDateTimeSchema.optional(),
  chipperId: z.string().optional().transform((val) => {
    if (!val) return undefined;
    const num = Number(val);
    if (isNaN(num) || num <= 0) {
      throw new Error('Invalid chipperId');
    }
    return num;
  }),
  chippingLocationId: z.string().optional().transform((val) => {
    if (!val) return undefined;
    const num = Number(val);
    if (isNaN(num) || num <= 0) {
      throw new Error('Invalid chippingLocationId');
    }
    return num;
  }),
  lifeStatus: z.enum(['ALIVE', 'DEAD']).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  from: z.string().optional().transform((val) => val ? Number(val) : 0),
  size: z.string().optional().transform((val) => val ? Number(val) : 10),
}).refine((data) => {
  return Number.isInteger(data.from) && data.from >= 0 &&
         Number.isInteger(data.size) && data.size > 0;
}, {
  message: 'from must be >= 0, size must be > 0',
});

// Create animal schema with proper validation
export const createAnimalSchema = z.object({
  animalTypes: z.array(z.number().positive()).min(1, 'At least one animal type is required').refine(
    (types) => {
      const uniqueTypes = new Set(types);
      return uniqueTypes.size === types.length;
    },
    { message: 'Animal types must be unique' },
  ),
  weight: z.number().positive('Weight must be positive'),
  length: z.number().positive('Length must be positive'),
  height: z.number().positive('Height must be positive'),
  gender: genderSchema,
  chipperId: z.number().positive('ChipperId must be positive'),
  chippingLocationId: z.number().positive('ChippingLocationId must be positive'),
});

// Update animal schema (all fields optional but with validation when present)
export const updateAnimalSchema = z.object({
  animalTypes: z.array(z.number().positive()).min(1, 'At least one animal type is required').refine(
    (types) => {
      const uniqueTypes = new Set(types);
      return uniqueTypes.size === types.length;
    },
    { message: 'Animal types must be unique' },
  ).optional(),
  weight: z.number().positive('Weight must be positive').optional(),
  length: z.number().positive('Length must be positive').optional(),
  height: z.number().positive('Height must be positive').optional(),
  gender: genderSchema.optional(),
  lifeStatus: lifeStatusSchema.optional(),
  chipperId: z.number().positive('ChipperId must be positive').optional(),
  chippingLocationId: z.number().positive('ChippingLocationId must be positive').optional(),
});

// Animal ID parameter schema (allows negative IDs for proper error handling)
export const animalIdParamSchema = z.object({
  id: z.union([z.string(), z.number()])
    .transform((val) => typeof val === 'string' ? Number(val) : val)
    .refine((num) => !isNaN(num), {
      message: 'Validation failed',
    })
    .refine((num) => num > 0, {
      message: 'Validation failed',
    }),
});

// Add animal type to animal schema
export const addAnimalTypeSchema = z.object({
  typeId: idSchema,
});

// Change animal type in animal schema (body only)
export const changeAnimalTypeSchema = z.object({
  oldTypeId: idSchema,
  newTypeId: idSchema,
});

// Change animal type params schema (for validateParams)
export const changeAnimalTypeParamsSchema = z.object({
  id: idSchema,
});

// Remove animal type from animal schema
export const removeAnimalTypeSchema = z.object({
  id: idSchema,
  typeId: idSchema,
});

export type SearchAnimalsInput = z.infer<typeof searchAnimalsSchema>;
export type CreateAnimalInput = z.infer<typeof createAnimalSchema>;
export type UpdateAnimalInput = z.infer<typeof updateAnimalSchema>;
