import type { APIRoute } from "astro";
import { TopicsService } from "../../../lib/services/topics.service";
import { topicQuerySchema, topicCreateSchema } from "../../../lib/schemas/topics.schema";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const rawParams = Object.fromEntries(url.searchParams);

    // Walidacja parametrów zapytania
    const result = topicQuerySchema.safeParse(rawParams);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_PARAMETERS",
            message: "Nieprawidłowe parametry zapytania",
            details: result.error.format(),
          },
        }),
        { status: 400 }
      );
    }

    const topicsService = new TopicsService(locals.supabase);
    const response = await topicsService.list(result.data);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Błąd podczas pobierania tematów:", error);
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił błąd podczas przetwarzania żądania",
        },
      }),
      { status: 500 }
    );
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();

    // Walidacja danych wejściowych
    const result = topicCreateSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_INPUT",
            message: "Nieprawidłowe dane wejściowe",
            details: result.error.format(),
          },
        }),
        { status: 400 }
      );
    }

    const topicsService = new TopicsService(locals.supabase);

    try {
      const topic = await topicsService.create(result.data);
      return new Response(JSON.stringify(topic), {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("już istnieje")) {
        return new Response(
          JSON.stringify({
            error: {
              code: "TOPIC_EXISTS",
              message: error.message,
            },
          }),
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Błąd podczas tworzenia tematu:", error);
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił błąd podczas przetwarzania żądania",
        },
      }),
      { status: 500 }
    );
  }
};
