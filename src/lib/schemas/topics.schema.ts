import { z } from "zod";

// Schema dla ID tematu
export const topicIdSchema = z.string().uuid();

// Schema dla parametrów zapytania GET /api/topics
export const topicQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(["created_at", "name", "updated_at"]).default("created_at"),
  parent_id: z.string().uuid().nullable().optional(),
});

// Schema dla tworzenia nowego tematu
export const topicCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  parent_id: z.string().uuid().optional(),
});

// Schema dla aktualizacji tematu
export const topicUpdateSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Przynajmniej jedno pole musi być zaktualizowane",
  });

// Typy inferowane ze schematów
export type TopicQueryParams = z.infer<typeof topicQuerySchema>;
export type TopicCreateParams = z.infer<typeof topicCreateSchema>;
export type TopicUpdateParams = z.infer<typeof topicUpdateSchema>;
