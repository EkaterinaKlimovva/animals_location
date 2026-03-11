import { z } from 'zod';
import { idSchema, emailSchema, nameSchema, passwordSchema, roleSchema, lenientNameSchema, lenientEmailSchema } from './commonSchemas';

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
  firstName: lenientNameSchema.refine((val) => !val || val.trim().length > 0, {
    message: 'First name cannot be only whitespace',
  }),
  lastName: lenientNameSchema.refine((val) => !val || val.trim().length > 0, {
    message: 'Last name cannot be only whitespace',
  }),
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
  firstName: lenientNameSchema,
  lastName: lenientNameSchema,
  email: lenientEmailSchema,
  from: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (typeof val === 'number') return val;
    return val ? Number(val) : 0;
  }),
  size: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (typeof val === 'number') return val;
    return val ? Number(val) : 10;
  }),
}).refine((data) => {
  return Number.isInteger(data.from) && data.from >= 0 &&
         Number.isInteger(data.size) && data.size > 0;
}, {
  message: 'from must be >= 0, size must be > 0',
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type AccountIdInput = z.infer<typeof accountIdParamSchema>;
export type SearchAccountsInput = z.infer<typeof searchAccountsSchema>;
