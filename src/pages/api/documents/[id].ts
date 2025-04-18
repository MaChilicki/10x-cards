import type { APIRoute } from "astro";
import { documentIdSchema, documentUpdateSchema } from "../../../lib/schemas/documents.schema";
import { DocumentsService } from "../../../lib/services/documents.service";
import { logger } from "../../../lib/services/logger.service";

export const prerender = false;

// Wspólna funkcja do walidacji ID dokumentu
const validateDocumentId = (params: Record<string, string | undefined>) => {
  if (!params.id) {
    return {
      success: false as const,
      error: "Brak ID dokumentu",
    };
  }

  const result = documentIdSchema.safeParse(params.id);
  if (!result.success) {
    return {
      success: false as const,
      error: "Nieprawidłowy format ID dokumentu",
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
    const idValidation = validateDocumentId(params);
    if (!idValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe ID dokumentu",
          details: idValidation.error,
          validationErrors: "details" in idValidation ? idValidation.details : undefined,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const documentsService = new DocumentsService(locals.supabase);

    try {
      const document = await documentsService.getDocumentById(idValidation.id);
      return new Response(JSON.stringify(document), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Dokument nie istnieje") {
        return new Response(
          JSON.stringify({
            error: "Nie znaleziono dokumentu",
            details: "Dokument o podanym ID nie istnieje",
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      logger.error(`Błąd podczas pobierania dokumentu ${idValidation.id}:`, error);
      return new Response(
        JSON.stringify({
          error: "Wystąpił błąd podczas pobierania dokumentu",
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
    const idValidation = validateDocumentId(params);
    if (!idValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe ID dokumentu",
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

    const validationResult = documentUpdateSchema.safeParse(body);
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

    try {
      const document = await documentsService.updateDocument(idValidation.id, validationResult.data);
      return new Response(JSON.stringify(document), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error(`Błąd podczas aktualizacji dokumentu ${idValidation.id}:`, error);
      return new Response(
        JSON.stringify({
          error: "Wystąpił błąd podczas aktualizacji dokumentu",
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
    const idValidation = validateDocumentId(params);
    if (!idValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe ID dokumentu",
          details: idValidation.error,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const documentsService = new DocumentsService(locals.supabase);

    try {
      await documentsService.deleteDocument(idValidation.id);
      return new Response(JSON.stringify({ message: "Dokument został pomyślnie usunięty" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error(`Błąd podczas usuwania dokumentu ${idValidation.id}:`, error);
      return new Response(
        JSON.stringify({
          error: "Wystąpił błąd podczas usuwania dokumentu",
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
