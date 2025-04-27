import type { APIRoute } from "astro";
import { AiGenerateService } from "../../../lib/services/ai-generate.service";
import { flashcardAiRegenerateSchema } from "../../../lib/schemas/ai-regenerate.schema";
import { logger } from "../../../lib/services/logger.service";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Sprawdzanie nagłówka Content-Type
    if (!request.headers.get("Content-Type")?.includes("application/json")) {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_CONTENT_TYPE",
            message: "Nieprawidłowy format danych",
            details: "Wymagany Content-Type: application/json",
          },
        }),
        {
          status: 415,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parsowanie body requestu
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_JSON",
            message: "Nieprawidłowy format JSON",
            details: "Nie można sparsować body requestu",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Walidacja danych wejściowych
    const validationResult = flashcardAiRegenerateSchema.safeParse(body);
    if (!validationResult.success) {
      logger.info("Nieprawidłowe dane wejściowe dla regeneracji fiszek AI:");
      logger.error("Szczegóły błędów walidacji:", validationResult.error.errors);
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

    // Inicjalizacja serwisu i regeneracja fiszek
    const aiService = new AiGenerateService(locals.supabase);
    const result = await aiService.regenerateFlashcards(validationResult.data);

    logger.debug("Pomyślnie zregenerowano fiszki AI");

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Obsługa specyficznych błędów
    if (error instanceof Error) {
      if (error.message.includes("not found") || error.message.includes("nie znaleziono")) {
        return new Response(
          JSON.stringify({
            error: {
              code: "DOCUMENT_NOT_FOUND",
              message: "Nie znaleziono dokumentu o podanym ID",
              details: error.message,
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
    }

    // Ogólna obsługa błędów
    logger.error("Błąd podczas regenerowania fiszek AI:", error);
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił błąd podczas regenerowania fiszek",
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
