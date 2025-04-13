import type { APIRoute } from 'astro';
import { AiGenerateService } from '../../../lib/services/ai-generate.service';
import { flashcardAiGenerateSchema } from '../../../lib/schemas/ai-generate.schema';
import { ZodError } from 'zod';
import { logger } from '../../../lib/services/logger.service';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    if (!request.headers.get("Content-Type")?.includes("application/json")) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowy format danych",
          details: "Wymagany Content-Type: application/json",
        }),
        {
          status: 415,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowy format JSON",
          details: "Nie można sparsować body requestu",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    // Walidacja danych wejściowych
    const validationResult = flashcardAiGenerateSchema.safeParse(body);
    if (!validationResult.success) {
      logger.info('Nieprawidłowe dane wejściowe dla generacji fiszek AI:');
      logger.error('Szczegóły błędów walidacji:', validationResult.error.errors);
      return new Response(JSON.stringify({
        error: 'Nieprawidłowe dane wejściowe',
        details: validationResult.error.errors
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Inicjalizacja serwisu i generacja fiszek
    const aiService = new AiGenerateService(locals.supabase);
    const result = await aiService.generateFlashcards(validationResult.data);
    
    logger.debug('Pomyślnie wygenerowano fiszki AI');
    
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    logger.error('Błąd podczas generowania fiszek AI:', error);
    return new Response(JSON.stringify({
      error: 'Wystąpił błąd podczas generowania fiszek',
      details: error instanceof Error ? error.message : 'Nieznany błąd'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 