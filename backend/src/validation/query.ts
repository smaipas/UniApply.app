import { z } from "zod";

export const PaginatedQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  cursor: z.string().optional(),
  status: z.string().optional(),
});
export type PaginatedQuery = z.infer<typeof PaginatedQuery>;
