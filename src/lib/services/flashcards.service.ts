import type { SupabaseClient } from "../../db/supabase.client";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import type {
  FlashcardDto,
  FlashcardsListResponseDto,
  PaginationDto,
  FlashcardCreateDto,
  FlashcardUpdate,
  FlashcardSource,
  Flashcard,
  FlashcardInsert,
} from "../../types";
import type { FlashcardsQueryParams } from "../schemas/flashcards.schema";
import { logger } from "./logger.service";
import { FlashcardModificationService } from "./flashcard-modification.service";

export class FlashcardsService {
  private modificationService: FlashcardModificationService;

  constructor(private readonly supabase: SupabaseClient) {
    this.modificationService = new FlashcardModificationService();
  }

  /**
   * Pobiera pojedynczą fiszkę po ID
   */
  async getFlashcardById(id: string): Promise<FlashcardDto | null> {
    try {
      const { data, error } = await this.supabase
        .from("flashcards")
        .select("*")
        .eq("id", id)
        .eq("is_disabled", false)
        .single();

      if (error) {
        logger.error("Błąd Supabase przy pobieraniu fiszki:", error);
        throw new Error(`Błąd podczas pobierania fiszki: ${error.message}`);
      }

      return data ? this.mapToFlashcardDtos([data])[0] : null;
    } catch (error) {
      logger.error("Błąd podczas pobierania fiszki:", error);
      throw new Error("Nie udało się pobrać fiszki");
    }
  }

  /**
   * Pobiera listę fiszek z paginacją i filtrowaniem
   */
  async getFlashcards(params: FlashcardsQueryParams): Promise<FlashcardsListResponseDto> {
    try {
      const { page = 1, limit = 10, sort, document_id, topic_id, source, is_approved } = params;

      // Budowanie zapytania bazowego
      let query = this.supabase.from("flashcards").select("*", { count: "exact" });

      // Dodawanie filtrów
      if (document_id) {
        query = query.eq("document_id", document_id);
      }
      if (topic_id) {
        query = query.eq("topic_id", topic_id);
      }
      if (source) {
        query = query.eq("source", source);
      }
      if (typeof is_approved === "boolean") {
        query = query.eq("is_approved", is_approved);
      }

      // Domyślnie pokazujemy tylko aktywne fiszki
      query = query.eq("is_disabled", false);

      // Sortowanie
      if (sort) {
        query = query.order(sort);
      } else {
        query = query.order("created_at", { ascending: false });
      }

      // Paginacja
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // Wykonanie zapytania
      const { data, error, count } = await query;

      if (error) {
        logger.error("Błąd Supabase przy pobieraniu fiszek:", error);
        throw new Error(`Błąd podczas pobierania fiszek: ${error.message}`);
      }

      // Przygotowanie odpowiedzi
      const pagination: PaginationDto = {
        page,
        limit,
        total: count || 0,
      };

      return {
        data: this.mapToFlashcardDtos(data || []),
        pagination,
      };
    } catch (error) {
      logger.error("Błąd podczas pobierania fiszek:", error);
      throw new Error("Nie udało się pobrać fiszek");
    }
  }

  /**
   * Tworzy nowe fiszki
   */
  async createFlashcards(flashcards: FlashcardCreateDto[]): Promise<void> {
    try {
      const { error } = await this.supabase.from("flashcards").insert(
        flashcards.map((flashcard) => ({
          ...flashcard,
          user_id: DEFAULT_USER_ID, // Tymczasowo, zostanie zastąpione przez Supabase Auth
          front_modified: flashcard.front_original,
          back_modified: flashcard.back_original,
          is_modified: false,
          is_disabled: false,
          // Dla fiszek manualnych zawsze ustawiamy is_approved na true
          is_approved: flashcard.source === "manual" ? true : flashcard.is_approved,
        }))
      );

      if (error) {
        logger.error("Błąd Supabase przy tworzeniu fiszek:", error);
        throw new Error(`Błąd podczas tworzenia fiszek: ${error.message}`);
      }

      logger.info(`Pomyślnie utworzono ${flashcards.length} fiszek`);
    } catch (error) {
      logger.error("Błąd podczas tworzenia fiszek:", error);
      throw new Error("Nie udało się utworzyć fiszek");
    }
  }

  /**
   * Aktualizuje fiszkę lub tworzy nową wersję jeśli stopień modyfikacji jest wystarczający (tylko dla fiszek AI)
   */
  async updateFlashcard(
    id: string,
    update: FlashcardUpdate,
    modificationPercentage: number
  ): Promise<{ flashcard: FlashcardDto; newFlashcard?: FlashcardDto }> {
    try {
      const originalFlashcard = await this.getFlashcardById(id);
      if (!originalFlashcard) {
        throw new Error("Nie znaleziono fiszki do aktualizacji");
      }

      // Dla fiszek manualnych zawsze aktualizujemy istniejącą fiszkę
      if (originalFlashcard.source === "manual") {
        const { data: updatedData, error: updateError } = await this.supabase
          .from("flashcards")
          .update({
            front_modified: update.front_modified || originalFlashcard.front_original,
            back_modified: update.back_modified || originalFlashcard.back_original,
          })
          .eq("id", id)
          .select()
          .single();

        if (updateError || !updatedData) {
          throw new Error(`Błąd podczas aktualizacji fiszki: ${updateError?.message}`);
        }

        return {
          flashcard: this.mapToFlashcardDtos([updatedData])[0],
        };
      }

      // Dla fiszek AI sprawdzamy stopień modyfikacji
      if (this.modificationService.shouldCreateNewVersion(modificationPercentage)) {
        // Oznaczamy oryginalną fiszkę jako zmodyfikowaną i nieaktywną
        const { error: updateError } = await this.supabase
          .from("flashcards")
          .update({
            is_modified: true,
            is_disabled: true,
            modification_percentage: modificationPercentage,
          })
          .eq("id", id);

        if (updateError) {
          throw new Error(`Błąd podczas aktualizacji oryginalnej fiszki: ${updateError.message}`);
        }

        // Tworzymy nową fiszkę jako manualną
        const newFrontModified = update.front_modified || originalFlashcard.front_original;
        const newBackModified = update.back_modified || originalFlashcard.back_original;

        const newFlashcard: FlashcardInsert = {
          front_original: newFrontModified,
          back_original: newBackModified,
          front_modified: newFrontModified,
          back_modified: newBackModified,
          topic_id: originalFlashcard.topic_id,
          document_id: originalFlashcard.document_id,
          source: "manual",
          is_approved: true,
          is_modified: false,
          is_disabled: false,
          user_id: DEFAULT_USER_ID, // Tymczasowo, zostanie zastąpione przez Supabase Auth
        };

        const { data: newData, error: insertError } = await this.supabase
          .from("flashcards")
          .insert(newFlashcard)
          .select()
          .single();

        if (insertError || !newData) {
          throw new Error(`Błąd podczas tworzenia nowej wersji fiszki: ${insertError?.message}`);
        }

        return {
          flashcard: this.mapToFlashcardDtos([originalFlashcard])[0],
          newFlashcard: this.mapToFlashcardDtos([newData])[0],
        };
      } else {
        // Aktualizujemy istniejącą fiszkę AI, zachowując oryginalne wartości
        const { data: updatedData, error: updateError } = await this.supabase
          .from("flashcards")
          .update({
            // Dla fiszek AI aktualizujemy tylko modified, zachowując oryginalne wartości
            front_modified: update.front_modified || originalFlashcard.front_original,
            back_modified: update.back_modified || originalFlashcard.back_original,
            modification_percentage: modificationPercentage,
            is_modified: modificationPercentage > 0,
          })
          .eq("id", id)
          .select()
          .single();

        if (updateError || !updatedData) {
          throw new Error(`Błąd podczas aktualizacji fiszki: ${updateError?.message}`);
        }

        return {
          flashcard: this.mapToFlashcardDtos([updatedData])[0],
        };
      }
    } catch (error) {
      logger.error("Błąd podczas aktualizacji fiszki:", error);
      throw new Error("Nie udało się zaktualizować fiszki");
    }
  }

  /**
   * Usuwa fiszkę (soft delete dla AI, hard delete dla manualnych)
   */
  async deleteFlashcard(id: string, source: FlashcardSource): Promise<void> {
    try {
      if (source === "ai") {
        // Soft delete dla fiszek AI
        const { error } = await this.supabase.from("flashcards").update({ is_disabled: true }).eq("id", id);

        if (error) {
          throw new Error(`Błąd podczas dezaktywacji fiszki: ${error.message}`);
        }
      } else {
        // Hard delete dla fiszek manualnych
        const { error } = await this.supabase.from("flashcards").delete().eq("id", id);

        if (error) {
          throw new Error(`Błąd podczas usuwania fiszki: ${error.message}`);
        }
      }

      logger.info(`Pomyślnie usunięto fiszkę ${id} (${source})`);
    } catch (error) {
      logger.error("Błąd podczas usuwania fiszki:", error);
      throw new Error("Nie udało się usunąć fiszki");
    }
  }

  /**
   * Mapuje encje bazodanowe na DTOs
   */
  private mapToFlashcardDtos(flashcards: Flashcard[]): FlashcardDto[] {
    return flashcards.map((flashcard) => ({
      id: flashcard.id,
      front_original: flashcard.front_original,
      back_original: flashcard.back_original,
      front_modified: flashcard.front_modified,
      back_modified: flashcard.back_modified,
      topic_id: flashcard.topic_id,
      document_id: flashcard.document_id,
      created_at: flashcard.created_at,
      updated_at: flashcard.updated_at,
      user_id: flashcard.user_id,
      modification_percentage: flashcard.modification_percentage,
      source: flashcard.source,
      is_approved: flashcard.is_approved,
      is_modified: flashcard.is_modified,
      is_disabled: flashcard.is_disabled,
      spaced_repetition_data: flashcard.spaced_repetition_data,
    }));
  }

  /**
   * Zatwierdza wiele fiszek jednocześnie
   * @param flashcard_ids Lista identyfikatorów fiszek do zatwierdzenia
   * @returns Liczba zatwierdzonych fiszek i ich dane
   */
  async approveBulk(flashcard_ids: string[]): Promise<{ approved_count: number; flashcards: FlashcardDto[] }> {
    try {
      // Aktualizujemy tylko fiszki AI, które nie są zatwierdzone i nie są dezaktywowane
      const { data, error } = await this.supabase
        .from("flashcards")
        .update({ is_approved: true })
        .in("id", flashcard_ids)
        .eq("source", "ai")
        .eq("is_approved", false)
        .eq("is_disabled", false)
        .select();

      if (error) {
        logger.error("Błąd podczas zatwierdzania fiszek:", error);
        throw new Error(`Błąd podczas zatwierdzania fiszek: ${error.message}`);
      }

      const approvedFlashcards = this.mapToFlashcardDtos(data || []);
      logger.info(`Pomyślnie zatwierdzono ${approvedFlashcards.length} fiszek`);

      return {
        approved_count: approvedFlashcards.length,
        flashcards: approvedFlashcards,
      };
    } catch (error) {
      logger.error("Błąd podczas zatwierdzania fiszek:", error);
      throw new Error("Nie udało się zatwierdzić fiszek");
    }
  }

  /**
   * Zatwierdza wszystkie fiszki dla danego dokumentu
   * @param document_id Identyfikator dokumentu
   * @returns Liczba zatwierdzonych fiszek i ich dane
   */
  async approveByDocument(document_id: string): Promise<{ approved_count: number; flashcards: FlashcardDto[] }> {
    try {
      // Sprawdzamy czy dokument istnieje
      const { data: document, error: documentError } = await this.supabase
        .from("documents")
        .select("id")
        .eq("id", document_id)
        .single();

      if (documentError || !document) {
        logger.error(`Dokument o ID ${document_id} nie istnieje`);
        throw new Error("Dokument nie istnieje");
      }

      // Aktualizujemy tylko fiszki AI, które nie są zatwierdzone i nie są dezaktywowane
      const { data, error } = await this.supabase
        .from("flashcards")
        .update({ is_approved: true })
        .eq("document_id", document_id)
        .eq("source", "ai")
        .eq("is_approved", false)
        .eq("is_disabled", false)
        .select();

      if (error) {
        logger.error("Błąd podczas zatwierdzania fiszek:", error);
        throw new Error(`Błąd podczas zatwierdzania fiszek: ${error.message}`);
      }

      const approvedFlashcards = this.mapToFlashcardDtos(data || []);
      logger.info(`Pomyślnie zatwierdzono ${approvedFlashcards.length} fiszek dla dokumentu ${document_id}`);

      return {
        approved_count: approvedFlashcards.length,
        flashcards: approvedFlashcards,
      };
    } catch (error) {
      logger.error("Błąd podczas zatwierdzania fiszek:", error);
      throw error;
    }
  }

  /**
   * Zatwierdza pojedynczą fiszkę
   * @param flashcard_id Identyfikator fiszki do zatwierdzenia
   * @returns Zatwierdzona fiszka
   */
  async approveOne(flashcard_id: string): Promise<FlashcardDto> {
    try {
      // Aktualizujemy tylko fiszki AI, które nie są zatwierdzone i nie są dezaktywowane
      const { data, error } = await this.supabase
        .from("flashcards")
        .update({ is_approved: true })
        .eq("id", flashcard_id)
        .eq("source", "ai")
        .eq("is_approved", false)
        .eq("is_disabled", false)
        .select()
        .single();

      if (error) {
        logger.error("Błąd podczas zatwierdzania fiszki:", error);
        throw new Error(`Błąd podczas zatwierdzania fiszki: ${error.message}`);
      }

      if (!data) {
        throw new Error("Nie znaleziono fiszki do zatwierdzenia lub fiszka nie spełnia warunków zatwierdzenia");
      }

      logger.info(`Pomyślnie zatwierdzono fiszkę ${flashcard_id}`);
      return this.mapToFlashcardDtos([data])[0];
    } catch (error) {
      logger.error("Błąd podczas zatwierdzania fiszki:", error);
      throw error;
    }
  }
}
