import type { APIRoute } from "astro";
import { FlashcardsService } from "../../../lib/services/flashcards.service";
import { FlashcardModificationService } from "../../../lib/services/flashcard-modification.service";
import { flashcardUpdateSchema } from "../../../lib/schemas/flashcards.schema";
import type { FlashcardSource } from "../../../types";
import { logger } from "../../../lib/services/logger.service";
import { supabaseClient } from "../../../db/supabase.client";

export const prerender = false;

const flashcardsService = new FlashcardsService(supabaseClient);
const modificationService = new FlashcardModificationService();

export const GET: APIRoute = async ({ params }) => {
  try {
    if (!params.id) {
      return new Response(
        JSON.stringify({
          error: "Nie podano identyfikatora fiszki",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const flashcard = await flashcardsService.getFlashcardById(params.id);

    if (!flashcard) {
      return new Response(
        JSON.stringify({
          error: "Nie znaleziono fiszki o podanym identyfikatorze",
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
        data: flashcard,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    logger.error("Błąd podczas pobierania fiszki:", error);

    return new Response(
      JSON.stringify({
        error: "Wystąpił błąd podczas przetwarzania żądania",
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

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Nie podano identyfikatora fiszki" }), { status: 400 });
    }

    const flashcard = await flashcardsService.getFlashcardById(id);
    if (!flashcard) {
      return new Response(JSON.stringify({ error: "Nie znaleziono fiszki o podanym identyfikatorze" }), {
        status: 404,
      });
    }

    const body = await request.json();
    const validationResult = flashcardUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane wejściowe",
          details: validationResult.error.format(),
        }),
        { status: 400 }
      );
    }

    const modificationPercentage =
      flashcard.source === "ai"
        ? modificationService.calculateModificationPercentage(flashcard, validationResult.data)
        : 0;

    const result = await flashcardsService.updateFlashcard(id, validationResult.data, modificationPercentage);

    return new Response(
      JSON.stringify({
        message: "Pomyślnie zaktualizowano fiszkę",
        data: result,
      }),
      { status: 200 }
    );
  } catch (error) {
    logger.error("Błąd podczas aktualizacji fiszki:", error);
    return new Response(JSON.stringify({ error: "Wystąpił błąd podczas aktualizacji fiszki" }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Nie podano identyfikatora fiszki" }), { status: 400 });
    }

    const body = await request.json();
    if (!body.source || !["ai", "manual"].includes(body.source)) {
      return new Response(JSON.stringify({ error: "Nieprawidłowy parametr source. Dozwolone wartości: ai, manual" }), {
        status: 400,
      });
    }

    const flashcard = await flashcardsService.getFlashcardById(id);
    if (!flashcard) {
      return new Response(
        JSON.stringify({ error: "Nie znaleziono fiszki o podanym identyfikatorze lub jest już wyłączona" }),
        {
          status: 404,
        }
      );
    }

    await flashcardsService.deleteFlashcard(id, body.source as FlashcardSource);

    return new Response(JSON.stringify({ message: `Pomyślnie usunięto fiszkę` }), { status: 200 });
  } catch (error) {
    logger.error("Błąd podczas usuwania fiszki:", error);
    return new Response(JSON.stringify({ error: "Wystąpił błąd podczas usuwania fiszki" }), { status: 500 });
  }
};
