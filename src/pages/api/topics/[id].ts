import type { APIRoute } from "astro";
import { TopicsService } from "../../../lib/services/topics.service";
import { topicUpdateSchema, topicIdSchema } from "../../../lib/schemas/topics.schema";
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
          error: {
            code: "INVALID_PARAMETER",
            message: "Nieprawidłowe ID tematu",
            details: idValidation.error,
            validationErrors: "details" in idValidation ? idValidation.details : undefined,
          },
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
            error: {
              code: "TOPIC_NOT_FOUND",
              message: "Temat nie został znaleziony",
            },
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      throw error;
    }
  } catch (error) {
    logger.error("Błąd podczas pobierania tematu:", error);
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
          error: {
            code: "INVALID_PARAMETER",
            message: "Nieprawidłowe ID tematu",
            details: idValidation.error,
            validationErrors: "details" in idValidation ? idValidation.details : undefined,
          },
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

    const validationResult = topicUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      logger.info("Nieprawidłowe dane wejściowe dla aktualizacji tematu:");
      logger.error("Szczegóły błędów walidacji:", validationResult.error.format());
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
      if (error instanceof Error) {
        if (error.message.includes("nie został znaleziony")) {
          return new Response(
            JSON.stringify({
              error: {
                code: "TOPIC_NOT_FOUND",
                message: "Temat nie został znaleziony",
              },
            }),
            {
              status: 404,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        if (error.message.includes("już istnieje")) {
          return new Response(
            JSON.stringify({
              error: {
                code: "TOPIC_EXISTS",
                message: error.message,
              },
            }),
            {
              status: 409,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }
      throw error;
    }
  } catch (error) {
    logger.error("Błąd podczas aktualizacji tematu:", error);
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
          error: {
            code: "INVALID_PARAMETER",
            message: "Nieprawidłowe ID tematu",
            details: idValidation.error,
            validationErrors: "details" in idValidation ? idValidation.details : undefined,
          },
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
      return new Response(
        JSON.stringify({
          message: "Temat został pomyślnie usunięty",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("nie został znaleziony")) {
          return new Response(
            JSON.stringify({
              error: {
                code: "TOPIC_NOT_FOUND",
                message: "Temat nie został znaleziony",
              },
            }),
            {
              status: 404,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
        if (error.message.includes("nie można usunąć")) {
          return new Response(
            JSON.stringify({
              error: {
                code: "TOPIC_IN_USE",
                message: error.message,
              },
            }),
            {
              status: 409,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }
      throw error;
    }
  } catch (error) {
    logger.error("Błąd podczas usuwania tematu:", error);
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
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
