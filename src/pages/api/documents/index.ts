import type { APIRoute } from "astro";
import { documentCreateSchema } from "../../../lib/schemas/document.schema";
import { DocumentsService } from "../../../lib/services/documents.service";
import { logger } from "../../../lib/services/logger.service";

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

    const validationResult = documentCreateSchema.safeParse(body);
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

    const documentsService = new DocumentsService(locals.supabase);
    const document = await documentsService.createDocument(validationResult.data);

    logger.info(`Utworzono nowy dokument o ID: ${document.id}`);

    return new Response(JSON.stringify(document), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Błąd podczas tworzenia dokumentu:", error);

    const errorMessage = error instanceof Error ? error.message : "Nieznany błąd";

    return new Response(
      JSON.stringify({
        error: "Wystąpił błąd podczas przetwarzania żądania",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
