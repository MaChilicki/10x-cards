import type { APIRoute } from "astro";
import { FlashcardsService } from "../../../lib/services/flashcards.service";
import { flashcardApproveByDocumentSchema } from "../../../lib/schemas/flashcards.schema";
import { logger } from "../../../lib/services/logger.service";
import { supabaseClient } from "../../../db/supabase.client";

export const prerender = false;

export const PATCH: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const validationResult = flashcardApproveByDocumentSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Nieprawidłowe dane wejściowe",
            details: validationResult.error.format(),
          },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const flashcardsService = new FlashcardsService(supabaseClient);
    const result = await flashcardsService.approveByDocument(validationResult.data.document_id);

    return new Response(
      JSON.stringify({
        message: "Fiszki zostały zatwierdzone pomyślnie",
        data: {
          approved_count: result.approved_count,
          flashcards: result.flashcards,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    logger.error("Błąd podczas zatwierdzania fiszek:", error);

    if (error instanceof Error && error.message.includes("nie istnieje")) {
      return new Response(
        JSON.stringify({
          error: {
            code: "DOCUMENT_NOT_FOUND",
            message: "Nie znaleziono dokumentu o podanym identyfikatorze",
          },
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił błąd podczas przetwarzania żądania",
          details: error instanceof Error ? error.message : "Nieznany błąd",
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
