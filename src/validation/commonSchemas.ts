import { z } from 'zod';

// Common integer ID validation schema (for account IDs)
export const intIdSchema = z.string().transform((val) => {
  const num = Number(val);
  if (isNaN(num) || num <= 0) {
    throw new Error('Invalid id');
  }
  return num;
});

// Common long ID validation schema (for animal, location, type IDs)
export const longIdSchema = z.string().transform((val) => {
  const num = Number(val);
  if (isNaN(num) || num <= 0) {
    throw new Error('Invalid id');
  }
  return num;
});

// Legacy ID schema for backward compatibility
export const idSchema = intIdSchema;

// Common pagination schemas
export const paginationSchema = z.object({
  from: z.string().optional().transform((val) => val ? Number(val) : 0),
  size: z.string().optional().transform((val) => val ? Number(val) : 10),
}).refine((data) => {
  return Number.isInteger(data.from) && data.from >= 0 &&
         Number.isInteger(data.size) && data.size > 0;
}, {
  message: 'Invalid pagination parameters',
});

// Common search pagination schemas (with validation)
export const searchPaginationSchema = z.object({
  from: z.string().optional().transform((val) => val ? Number(val) : 0),
  size: z.string().optional().transform((val) => val ? Number(val) : 10),
}).refine((data) => {
  return Number.isInteger(data.from) && data.from >= 0 &&
         Number.isInteger(data.size) && data.size > 0;
}, {
  message: 'from must be >= 0, size must be > 0',
});

// Common email validation
export const emailSchema = z.string().trim().min(1, 'Email is required').email('Invalid email format');

// Common name validation (strict validation)
export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(50, 'Name must be less than 50 characters')
  .refine((val) => val.trim().length > 0, 'Name cannot be only whitespace')
  .transform((val) => val.trim());

// Common password validation (with trimming)
export const passwordSchema = z.string().trim().min(6, 'Password must be at least 6 characters');

// Common ISO-8601 date time validation
export const isoDateTimeSchema = z.string().refine((val) => {
  return !isNaN(Date.parse(val));
}, {
  message: 'Must be in ISO-8601 format',
});

// Common gender validation
export const genderSchema = z.enum(['MALE', 'FEMALE', 'OTHER'], {
  message: 'Gender must be one of: MALE, FEMALE, OTHER',
});

// Common life status validation
export const lifeStatusSchema = z.enum(['ALIVE', 'DEAD'], {
  message: 'Life status must be one of: ALIVE, DEAD',
});
