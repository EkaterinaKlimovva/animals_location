import { z } from 'zod';

// Common integer ID validation schema (for account IDs)
export const idSchema = z.union([z.string(), z.number()])
  .transform((val) => typeof val === 'string' ? Number(val) : val)
  .refine((num) => !isNaN(num), {
    message: 'Validation failed',
  })
  .refine((num) => num > 0, {
    message: 'Validation failed',
  });

// Common email validation with RFC 5322 compliant pattern
export const emailSchema = z.string()
  .trim()
  .min(1, 'Email is required')
  .refine((val) => !val || val === '' || val.includes('@'), {
    message: 'Invalid email format',
  })
  .refine((val) => {
    if (!val || val === '') return true;
    // RFC 5322 compliant email regex pattern
    const emailRegex = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;
    return emailRegex.test(val);
  }, {
    message: 'Invalid email format',
  });

// Common name validation (strict validation)
export const nameSchema = z.string()
  .trim()
  .min(1, 'Name is required')
  .refine((val) => val.trim().length > 0, 'Name cannot be only whitespace');

// Common password validation (with trimming)
export const passwordSchema = z.string()
  .trim()
  .min(1, 'Password is required')
  .refine((val) => val.trim().length > 0, 'Password cannot be only whitespace');

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
