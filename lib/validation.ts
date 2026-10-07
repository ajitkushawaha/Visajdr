import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2).max(80),
  status: z.enum(['active','inactive']).optional().default('active'),
});

export const updateCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(80),
  status: z.enum(['active','inactive']),
});

export const listQuerySchema = z.object({
  key: z.enum(['name','slug','status']).optional(),
  value: z.string().optional(),
  from: z.string().optional(), // ISO date
  to: z.string().optional(),   // ISO date
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  sort: z.enum(['createdAt','updatedAt','name']).optional().default('createdAt'),
  dir: z.enum(['asc','desc']).optional().default('desc'),
});
