import type { APIRoute } from "astro";
import { TopicsService } from "../../../lib/services/topics.service";
import { topicIdSchema, topicUpdateSchema } from "../../../lib/schemas/topics.schema";
import { logger } from "../../../lib/services/logger.service";

export const prerender = false;

// Wspólna funkcja do walidacji ID tematu
const validateTopicId = (params: Record<string, string | undefined>) => {
  if (!params.id) {
    return {
      success: false as const,
      error: "Brak ID tematu",
    };
  }

  const result = topicIdSchema.safeParse(params.id);
  if (!result.success) {
    return {
      success: false as const,
      error: "Nieprawidłowy format ID tematu",
      details: result.error.format(),
    };
  }

  return {
    success: true as const,
    id: result.data,
  };
};

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const idValidation = validateTopicId(params);
    if (!idValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe ID tematu",
          details: idValidation.error,
          validationErrors: "details" in idValidation ? idValidation.details : undefined,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const topicsService = new TopicsService(locals.supabase);

    try {
      const topic = await topicsService.getById(idValidation.id);
      return new Response(JSON.stringify(topic), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("nie został znaleziony")) {
        return new Response(
          JSON.stringify({
            error: "Nie znaleziono tematu",
            details: "Temat o podanym ID nie istnieje",
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      logger.error(`Błąd podczas pobierania tematu ${idValidation.id}:`, error);
      return new Response(
        JSON.stringify({
          error: "Wystąpił błąd podczas pobierania tematu",
          details: error instanceof Error ? error.message : "Nieznany błąd",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    logger.error("Nieoczekiwany błąd podczas przetwarzania żądania GET:", error);
    return new Response(
      JSON.stringify({
        error: "Wystąpił nieoczekiwany błąd",
        details: error instanceof Error ? error.message : "Nieznany błąd",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const PUT: APIRoute = async ({ request, params, locals }) => {
  try {
    const idValidation = validateTopicId(params);
    if (!idValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe ID tematu",
          details: idValidation.error,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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

    const validationResult = topicUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane wejściowe",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const topicsService = new TopicsService(locals.supabase);

    try {
      const topic = await topicsService.update(idValidation.id, validationResult.data);
      return new Response(JSON.stringify(topic), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error(`Błąd podczas aktualizacji tematu ${idValidation.id}:`, error);
      return new Response(
        JSON.stringify({
          error: "Wystąpił błąd podczas aktualizacji tematu",
          details: error instanceof Error ? error.message : "Nieznany błąd",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    logger.error("Nieoczekiwany błąd podczas przetwarzania żądania PUT:", error);
    return new Response(
      JSON.stringify({
        error: "Wystąpił nieoczekiwany błąd",
        details: error instanceof Error ? error.message : "Nieznany błąd",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const idValidation = validateTopicId(params);
    if (!idValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe ID tematu",
          details: idValidation.error,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const topicsService = new TopicsService(locals.supabase);

    try {
      await topicsService.delete(idValidation.id);
      return new Response(null, { status: 204 });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("nie został znaleziony")) {
          return new Response(
            JSON.stringify({
              error: "Nie znaleziono tematu",
              details: "Temat o podanym ID nie istnieje",
            }),
            {
              status: 404,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        if (error.message.includes("ma podrzędne tematy")) {
          return new Response(
            JSON.stringify({
              error: "Nie można usunąć tematu",
              details: "Temat posiada podrzędne tematy. Usuń najpierw wszystkie podtematy.",
            }),
            {
              status: 409,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        if (error.message.includes("ma przypisane dokumenty")) {
          return new Response(
            JSON.stringify({
              error: "Nie można usunąć tematu",
              details: "Temat posiada przypisane dokumenty. Usuń najpierw wszystkie dokumenty.",
            }),
            {
              status: 409,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        if (error.message.includes("ma przypisane fiszki")) {
          return new Response(
            JSON.stringify({
              error: "Nie można usunąć tematu",
              details: "Temat posiada przypisane fiszki. Usuń najpierw wszystkie fiszki.",
            }),
            {
              status: 409,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }
      logger.error(`Błąd podczas usuwania tematu ${idValidation.id}:`, error);
      return new Response(
        JSON.stringify({
          error: "Wystąpił błąd podczas usuwania tematu",
          details: error instanceof Error ? error.message : "Nieznany błąd",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    logger.error("Nieoczekiwany błąd podczas przetwarzania żądania DELETE:", error);
    return new Response(
      JSON.stringify({
        error: "Wystąpił nieoczekiwany błąd",
        details: error instanceof Error ? error.message : "Nieznany błąd",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
