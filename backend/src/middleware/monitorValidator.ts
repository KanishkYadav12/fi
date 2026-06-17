import { z } from 'zod';

export const createMonitorSchema = z.object({
  body: z.object({
    url: z.string().url({ message: 'Invalid URL format' }),
    name: z.string().optional(),
  }),
});
