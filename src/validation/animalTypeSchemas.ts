import { z } from 'zod';

// Create animal type schema
export const createAnimalTypeSchema = z.object({
  type: z.string().trim().min(1, 'Type is required'),
});

// Update animal type schema (optional field with validation)
export const updateAnimalTypeSchema = z.object({
  type: z.string().trim().min(1, 'Type is required').optional(),
});

export type CreateAnimalTypeInput = z.infer<typeof createAnimalTypeSchema>;
export type UpdateAnimalTypeInput = z.infer<typeof updateAnimalTypeSchema>;
