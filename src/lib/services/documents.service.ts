import type { SupabaseClient } from "../../db/supabase.client";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import type { DocumentDto, DocumentsListResponseDto } from "@/types";
import type { DocumentsQueryParams, DocumentCreateParams, DocumentUpdateParams } from "../schemas/documents.schema";
import { AiGenerateService } from "./ai-generate.service";
import { logger } from "./logger.service";

/**
 * Serwis obsługujący operacje na dokumentach
 * Zapewnia podstawowe operacje CRUD oraz integrację z generowaniem fiszek
 */
export class DocumentsService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly aiGenerateService: AiGenerateService = new AiGenerateService(supabase)
  ) {}

  /**
   * Pobiera listę dokumentów z możliwością filtrowania i paginacji
   * @param params Parametry zapytania (strona, limit, sortowanie, nazwa)
   * @returns Lista dokumentów i całkowita liczba wyników
   * @throws Error gdy wystąpi problem z bazą danych
   */
  async listDocuments(params: DocumentsQueryParams): Promise<DocumentsListResponseDto> {
    const { page, limit, sort, name, topic_id } = params;
    const offset = (page - 1) * limit;

    let query = this.supabase.from("documents").select("*", { count: "exact" });

    // Dodaj filtrowanie po topic_id
    if (topic_id) {
      query = query.eq("topic_id", topic_id);
    }

    // Dodaj filtrowanie po nazwie, jeśli podano
    if (name) {
      query = query.ilike("name", `%${name}%`);
    }

    // Dodaj sortowanie
    const [column, order] = sort.startsWith("-") ? [sort.slice(1), "desc" as const] : [sort, "asc" as const];
    query = query.order(column, { ascending: order === "asc" });

    // Dodaj paginację
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      logger.error("Błąd podczas pobierania listy dokumentów:", error);
      throw new Error("Nie udało się pobrać listy dokumentów");
    }

    return {
      documents: data as DocumentDto[],
      total: count ?? 0,
    };
  }

  /**
   * Tworzy nowy dokument i inicjuje generowanie fiszek
   * @param data Dane nowego dokumentu
   * @returns Utworzony dokument
   * @throws Error gdy wystąpi problem z bazą danych lub walidacją
   */
  async createDocument(data: DocumentCreateParams): Promise<DocumentDto> {
    // Dodajemy user_id do danych dokumentu
    const documentData = {
      ...data,
      user_id: DEFAULT_USER_ID,
    };

    const { data: document, error } = await this.supabase.from("documents").insert(documentData).select().single();

    if (error) {
      logger.error("Błąd podczas tworzenia dokumentu:", error);
      throw new Error("Nie udało się utworzyć dokumentu");
    }

    // Asynchronicznie zainicjuj generowanie fiszek
    try {
      logger.debug(`Rozpoczęto generowanie fiszek dla dokumentu ${document.id}`);

      await this.aiGenerateService.generateFlashcards({
        text: data.content,
        document_id: document.id,
        topic_id: data.topic_id,
      });

      logger.info(`Pomyślnie zainicjowano generowanie fiszek dla dokumentu ${document.id}`);
    } catch (error) {
      logger.error("Błąd podczas inicjowania generowania fiszek:", error);
      // Nie przerywamy flow w przypadku błędu generowania fiszek
    }

    return document as DocumentDto;
  }

  /**
   * Pobiera dokument o określonym ID
   * @param id ID dokumentu
   * @returns Dokument
   * @throws Error gdy dokument nie istnieje lub wystąpi problem z bazą danych
   */
  async getDocumentById(id: string): Promise<DocumentDto> {
    const { data: document, error } = await this.supabase.from("documents").select("*").eq("id", id).single();

    if (error) {
      logger.error(`Błąd podczas pobierania dokumentu o ID ${id}:`, error);
      throw new Error("Nie udało się pobrać dokumentu");
    }

    if (!document) {
      throw new Error("Dokument nie istnieje");
    }

    return document as DocumentDto;
  }

  /**
   * Aktualizuje istniejący dokument
   * @param id ID dokumentu
   * @param data Dane do aktualizacji
   * @returns Zaktualizowany dokument
   * @throws Error gdy wystąpi problem z bazą danych
   */
  async updateDocument(id: string, data: DocumentUpdateParams): Promise<DocumentDto> {
    const { data: document, error } = await this.supabase.from("documents").update(data).eq("id", id).select().single();

    if (error) {
      logger.error(`Błąd podczas aktualizacji dokumentu o ID ${id}:`, error);
      throw new Error("Nie udało się zaktualizować dokumentu");
    }

    return document as DocumentDto;
  }

  /**
   * Usuwa dokument i powiązane z nim fiszki
   * @param id ID dokumentu
   * @throws Error gdy wystąpi problem z bazą danych
   */
  async deleteDocument(id: string): Promise<void> {
    const { error: deleteFlashcardsError } = await this.supabase.from("flashcards").delete().eq("document_id", id);

    if (deleteFlashcardsError) {
      logger.error(`Błąd podczas usuwania fiszek dla dokumentu ${id}:`, deleteFlashcardsError);
      throw new Error("Nie udało się usunąć powiązanych fiszek");
    }

    const { error: deleteDocumentError } = await this.supabase.from("documents").delete().eq("id", id);

    if (deleteDocumentError) {
      logger.error(`Błąd podczas usuwania dokumentu o ID ${id}:`, deleteDocumentError);
      throw new Error("Nie udało się usunąć dokumentu");
    }
  }
}
