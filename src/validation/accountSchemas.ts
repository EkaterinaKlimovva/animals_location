import { z } from 'zod';
import { idSchema, emailSchema, nameSchema, passwordSchema, roleSchema } from './commonSchemas';

// Registration schema (same as createAccountSchema)
export const registrationSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

// Create account schema (alias for registration)
export const createAccountSchema = registrationSchema;

// Extended create account schema with optional animal validation
export const createAccountWithAnimalsSchema = registrationSchema.extend({
  animalIds: z.array(z.number().positive()).optional(),
});

// Update account schema (all fields optional but with validation when present)
export const updateAccountSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  role: roleSchema.optional(),
}).refine((data) => {
  return Object.keys(data).length > 0;
}, {
  message: 'At least one field must be provided for update',
});

// Account ID parameter schema (allows negative IDs)
export const accountIdParamSchema = z.object({
  id: idSchema,
});

// Search accounts schema
export const searchAccountsSchema = z.object({
  firstName: z.string().trim().optional().transform(val => val && val.trim() || undefined),
  lastName: z.string().trim().optional().transform(val => val && val.trim() || undefined),
  email: z.string().trim().optional().transform(val => val && val.trim() || undefined),
  from: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (typeof val === 'number') return val;
    return val ? Number(val) : 0;
  }),
  size: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (typeof val === 'number') return val;
    return val ? Number(val) : 10;
  }),
}).refine((data) => {
  const from = data.from ?? 0;
  const size = data.size ?? 10;
  return Number.isInteger(from) && from >= 0 &&
         Number.isInteger(size) && size > 0;
}, {
  message: 'from must be >= 0, size must be > 0',
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type CreateAccountWithAnimalsInput = z.infer<typeof createAccountWithAnimalsSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type SearchAccountsInput = z.infer<typeof searchAccountsSchema>;
