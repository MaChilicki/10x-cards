import type { APIRoute } from "astro";
import { FlashcardsService } from "../../../lib/services/flashcards.service";
import { flashcardsQuerySchema, flashcardsCreateCommandSchema } from "../../../lib/schemas/flashcards.schema";
import { logger } from "../../../lib/services/logger.service";
import { supabaseClient } from "../../../db/supabase.client";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    // Pobranie i walidacja parametrów zapytania
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    logger.debug(`Otrzymane parametry zapytania: ${JSON.stringify(queryParams)}`);

    const validationResult = flashcardsQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      logger.error(`Błąd walidacji parametrów: ${JSON.stringify(validationResult.error.format())}`);
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Nieprawidłowe parametry zapytania",
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

    logger.debug(`Zwalidowane parametry: ${JSON.stringify(validationResult.data)}`);

    // Utworzenie serwisu i pobranie danych
    const flashcardsService = new FlashcardsService(supabaseClient);
    const response = await flashcardsService.getFlashcards(validationResult.data);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    logger.error("Błąd podczas pobierania fiszek:", error);

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

export const POST: APIRoute = async ({ request }) => {
  try {
    // Pobranie i walidacja ciała żądania
    const body = await request.json();
    const validationResult = flashcardsCreateCommandSchema.safeParse(body);

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

    // Sprawdzenie czy wszystkie fiszki mają source="manual"
    const hasNonManualSource = validationResult.data.flashcards.some((flashcard) => flashcard.source !== "manual");
    if (hasNonManualSource) {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_SOURCE",
            message: "Ten endpoint obsługuje tylko fiszki typu manual",
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

    // Utworzenie serwisu i zapisanie fiszek
    const flashcardsService = new FlashcardsService(supabaseClient);
    await flashcardsService.createFlashcards(validationResult.data.flashcards);

    return new Response(
      JSON.stringify({
        message: "Fiszki zostały utworzone pomyślnie",
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    logger.error("Błąd podczas tworzenia fiszek:", error);

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
