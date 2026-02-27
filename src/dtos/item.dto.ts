import { z } from 'zod';

export const CreateItemDto = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().url().optional(),
  price: z.number().min(0),
  category: z.string().optional(),
  available: z.boolean().optional(),
});

export const UpdateItemDto = CreateItemDto.partial();

export type CreateItem = z.infer<typeof CreateItemDto>;
export type UpdateItem = z.infer<typeof UpdateItemDto>;
