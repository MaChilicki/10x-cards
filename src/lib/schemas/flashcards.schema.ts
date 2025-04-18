import { z } from "zod";
import type { FlashcardSource } from "../../types";

// Walidacja parametrów zapytania dla listy fiszek
export const flashcardsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
  sort: z.string().optional(),
  document_id: z.string().uuid().optional(),
  topic_id: z.string().uuid().optional(),
  source: z.enum(["ai", "manual"] as const).optional(),
  is_approved: z.coerce.boolean().optional(),
});

// Walidacja pojedynczej fiszki przy tworzeniu
export const flashcardCreateSchema = z.object({
  front_original: z.string().min(1).max(1000),
  back_original: z.string().min(1).max(1000),
  topic_id: z.string().uuid().optional(),
  document_id: z.string().uuid().optional(),
  source: z.enum(["ai", "manual"] as const),
  is_approved: z.boolean().default(false),
});

// Walidacja komendy tworzenia wielu fiszek
export const flashcardsCreateCommandSchema = z.object({
  flashcards: z.array(flashcardCreateSchema),
});

// Walidacja aktualizacji fiszki
export const flashcardUpdateSchema = z.object({
  front_modified: z.string().min(1).max(1000).optional(),
  back_modified: z.string().min(1).max(1000).optional(),
});

// Walidacja usuwania fiszki
export const flashcardDeleteSchema = z.object({
  source: z.enum(["ai", "manual"], {
    required_error: "Źródło fiszki jest wymagane",
    invalid_type_error: "Źródło fiszki musi być typu 'ai' lub 'manual'",
  }),
});

// Walidacja zatwierdzania wielu fiszek
export const flashcardApproveBulkSchema = z.object({
  flashcard_ids: z
    .array(z.string().uuid(), {
      required_error: "Lista identyfikatorów fiszek jest wymagana",
      invalid_type_error: "Lista identyfikatorów fiszek musi być tablicą UUID",
    })
    .min(1, "Lista identyfikatorów fiszek nie może być pusta"),
});

// Walidacja zatwierdzania fiszek dla dokumentu
export const flashcardApproveByDocumentSchema = z.object({
  document_id: z.string().min(1, "Identyfikator dokumentu jest wymagany").uuid("Identyfikator dokumentu musi być UUID"),
});

// Walidacja ID fiszki
export const flashcardIdSchema = z.string().uuid("Identyfikator fiszki musi być poprawnym UUID");

// Typy inferowane ze schematów
export type FlashcardsQueryParams = z.infer<typeof flashcardsQuerySchema>;
export type FlashcardCreate = z.infer<typeof flashcardCreateSchema>;
export type FlashcardsCreateCommand = z.infer<typeof flashcardsCreateCommandSchema>;
export type FlashcardUpdate = z.infer<typeof flashcardUpdateSchema>;
export type FlashcardDeleteParams = z.infer<typeof flashcardDeleteSchema>;
export type FlashcardApproveBulkParams = z.infer<typeof flashcardApproveBulkSchema>;
export type FlashcardApproveByDocumentParams = z.infer<typeof flashcardApproveByDocumentSchema>;
