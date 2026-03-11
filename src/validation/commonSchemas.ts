import { z } from 'zod';

// Common integer ID validation schema (for account IDs)
export const idSchema = z.union([z.string(), z.number()])
  .transform((val) => typeof val === 'string' ? Number(val) : val)
  .refine((num) => !isNaN(num), {
    message: 'Invalid id format',
  })
  .refine((num) => num > 0, {
    message: 'Invalid id',
  });

// Common email validation
export const emailSchema = z.string()
  .trim()
  .min(1, 'Email is required')
  .refine((val) => val.trim().length > 0, 'Email cannot be only whitespace')
  .email('Invalid email format');

// Lenient email validation (for existing data that may have empty/whitespace values)
export const lenientEmailSchema = z.string()
  .trim()
  .max(100, 'Email must be less than 100 characters')
  .optional()
  .refine((val) => !val || val === '' || val.includes('@'), {
    message: 'Invalid email format',
  });

// Common name validation (strict validation)
export const nameSchema = z.string()
  .trim()
  .min(1, 'Name is required')
  .max(50, 'Name must be less than 50 characters')
  .refine((val) => val.trim().length > 0, 'Name cannot be only whitespace');

// Lenient name validation (for existing data that may have empty/whitespace values)
export const lenientNameSchema = z.string()
  .trim()
  .max(50, 'Name must be less than 50 characters')
  .optional();

// Common password validation (with trimming)
export const passwordSchema = z.string().trim();

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

// Common role validation
export const roleSchema = z.string()
  .trim()
  .min(1, 'Role is required')
  .refine((val) => val.trim().length > 0, 'Role cannot be only whitespace');
