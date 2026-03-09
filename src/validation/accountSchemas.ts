import { z } from 'zod';
import { intIdSchema, emailSchema, nameSchema, passwordSchema } from './commonSchemas';

// Registration schema (same as createAccountSchema)
export const registrationSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

// Create account schema (alias for registration)
export const createAccountSchema = registrationSchema;

// Update account schema (all fields optional but with validation when present)
export const updateAccountSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').optional(),
  lastName: z.string().trim().min(1, 'Last name is required').optional(),
  email: z.string().trim().email('Invalid email format').optional(),
  password: z.string().trim().min(6, 'Password must be at least 6 characters').optional(),
});

// Account ID schema (int ID)
export const accountIdSchema = z.object({
  id: intIdSchema,
});

// Account data validation for reading (lenient validation)
export const accountDataSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email('Invalid email format'),
});

// Account data validation for updates (strict validation)
export const accountUpdateDataSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
});

// Search accounts schema
export const searchAccountsSchema = z.object({
  firstName: z.string().transform((val) => val.trim() === '' ? undefined : val.trim()).optional(),
  lastName: z.string().transform((val) => val.trim() === '' ? undefined : val.trim()).optional(),
  email: z.string().transform((val) => val.trim() === '' ? undefined : val.trim()).optional(),
  from: z.string().optional().transform((val) => val ? Number(val) : 0),
  size: z.string().optional().transform((val) => val ? Number(val) : 10),
}).refine((data) => {
  return Number.isInteger(data.from) && data.from >= 0 &&
         Number.isInteger(data.size) && data.size > 0;
}, {
  message: 'from must be >= 0, size must be > 0',
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type AccountIdInput = z.infer<typeof accountIdSchema>;
export type AccountDataInput = z.infer<typeof accountDataSchema>;
export type AccountUpdateDataInput = z.infer<typeof accountUpdateDataSchema>;
export type SearchAccountsInput = z.infer<typeof searchAccountsSchema>;
