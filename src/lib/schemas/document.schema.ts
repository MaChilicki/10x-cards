import { z } from "zod";

export const documentCreateSchema = z.object({
  name: z.string().min(1, "Nazwa dokumentu jest wymagana"),
  content: z
    .string()
    .min(1000, "Treść dokumentu musi zawierać co najmniej 1000 znaków")
    .max(10000, "Treść dokumentu nie może przekraczać 10000 znaków"),
  topic_id: z.string().uuid("Nieprawidłowy format UUID").optional(),
});

export type DocumentCreateSchema = typeof documentCreateSchema;
