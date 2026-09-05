import { z } from 'zod';

// Form Validations according to assignment specification:
// - Name: Min 20 characters, Max 60 characters
// - Address: Max 400 characters
// - Password: 8-16 characters, must include at least one uppercase letter and one special character
// - Email: standard email validation

const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/;
const uppercaseRegex = /[A-Z]/;

export const nameSchema = z
  .string({ required_error: 'Name is required' })
  .trim()
  .min(20, 'Name must be at least 20 characters long')
  .max(60, 'Name cannot exceed 60 characters');

export const storeNameSchema = z
  .string({ required_error: 'Store name is required' })
  .trim()
  .min(3, 'Store name must be at least 3 characters long')
  .max(60, 'Store name cannot exceed 60 characters');

export const addressSchema = z
  .string({ required_error: 'Address is required' })
  .trim()
  .min(1, 'Address is required')
  .max(400, 'Address cannot exceed 400 characters');

export const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters long')
  .max(16, 'Password cannot exceed 16 characters')
  .refine((val) => uppercaseRegex.test(val), {
    message: 'Password must include at least one uppercase letter',
  })
  .refine((val) => specialCharRegex.test(val), {
    message: 'Password must include at least one special character (!@#$%^&*...)',
  });

export const emailSchema = z
  .string({ required_error: 'Email is required' })
  .trim()
  .email('Invalid email address format');

// Auth Schemas
export const SignupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  address: addressSchema,
});

export const LoginSchema = z.object({
  email: emailSchema,
  password: z.string({ required_error: 'Password is required' }),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string({ required_error: 'Current password is required' }),
  newPassword: passwordSchema,
});

// Admin Schemas
export const CreateUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  address: addressSchema,
  role: z.enum(['ADMIN', 'USER', 'STORE_OWNER'], {
    required_error: 'Role is required (ADMIN, USER, STORE_OWNER)',
  }),
});

export const CreateStoreSchema = z.object({
  name: storeNameSchema,
  email: emailSchema,
  address: addressSchema,
  ownerId: z.string().optional().nullable(),
});

// Rating Schema
export const SubmitRatingSchema = z.object({
  storeId: z.string({ required_error: 'Store ID is required' }),
  score: z
    .number({ required_error: 'Rating score is required' })
    .int('Rating score must be an integer')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
});

// Query Filter Schema for User/Store listings
export const QueryFilterSchema = z.object({
  search: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['ADMIN', 'USER', 'STORE_OWNER', 'ALL']).optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
});
