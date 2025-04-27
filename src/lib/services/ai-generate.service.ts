import type { SupabaseClient } from "../../db/supabase.client";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import type {
  FlashcardAiGenerateDto,
  FlashcardAiResponse,
  FlashcardProposalDto,
  AiRegenerateResponseDto,
} from "../../types";
import { logger } from "./logger.service";
import { FlashcardsService } from "./flashcards.service";
import { flashcardAiRegenerateSchema } from "../schemas/ai-regenerate.schema";
import { z } from "zod";

export class AiGenerateService {
  private flashcardsService: FlashcardsService;

  constructor(private supabase: SupabaseClient) {
    this.flashcardsService = new FlashcardsService(supabase);
  }

  private async saveFlashcards(flashcards: FlashcardProposalDto[]): Promise<void> {
    try {
      // Na etapie developmentu używamy DEFAULT_USER_ID
      const flashcardsWithUser = flashcards.map((flashcard) => ({
        ...flashcard,
        user_id: DEFAULT_USER_ID,
        // Kopiowanie wartości z pól _original do pól _modified
        front_modified: flashcard.front_original,
        back_modified: flashcard.back_original,
      }));
      await this.flashcardsService.createFlashcards(flashcardsWithUser);
      logger.debug(`Zapisano ${flashcards.length} fiszek w bazie danych`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Nieznany błąd";
      logger.error(`Błąd podczas zapisywania fiszek: ${errorMessage}`, error);
      throw new Error(`Nie udało się zapisać fiszek: ${errorMessage}`);
    }
  }

  async generateFlashcards(data: FlashcardAiGenerateDto): Promise<FlashcardAiResponse> {
    try {
      logger.debug(`Rozpoczęto generowanie fiszek${data.document_id ? ` dla dokumentu ${data.document_id}` : ""}`);

      // TODO: Implementacja integracji z modelem AI
      // Na tym etapie zwracamy mock odpowiedzi
      const mockFlashcards: FlashcardProposalDto[] = [
        {
          front_original: "Co to jest TypeScript?",
          back_original:
            "TypeScript to typowany nadzbiór JavaScript, który kompiluje się do czystego JavaScript. Dodaje opcjonalne typy, klasy i moduły do JavaScript.",
          topic_id: data.topic_id,
          document_id: data.document_id,
          source: "ai",
          is_approved: false,
        },
        {
          front_original: "Jakie są główne zalety TypeScript?",
          back_original:
            "Główne zalety TypeScript to: statyczne typowanie, wsparcie dla nowoczesnych funkcji JavaScript, lepsze wsparcie IDE, wykrywanie błędów podczas kompilacji, łatwiejsze refaktorowanie kodu.",
          topic_id: data.topic_id,
          document_id: data.document_id,
          source: "ai",
          is_approved: false,
        },
        {
          front_original: "Czym jest interfejs w TypeScript?",
          back_original:
            "Interfejs w TypeScript to kontrakt, który definiuje strukturę obiektu. Określa nazwy właściwości, ich typy oraz opcjonalność. Służy do definiowania kształtu danych i typów złożonych.",
          topic_id: data.topic_id,
          document_id: data.document_id,
          source: "ai",
          is_approved: false,
        },
        {
          front_original: "Co to jest type inference w TypeScript?",
          back_original:
            "Type inference to mechanizm automatycznego wnioskowania typów przez TypeScript na podstawie przypisanych wartości i kontekstu użycia. Redukuje potrzebę jawnego deklarowania typów.",
          topic_id: data.topic_id,
          document_id: data.document_id,
          source: "ai",
          is_approved: false,
        },
        {
          front_original: "Jak działa dziedziczenie w TypeScript?",
          back_original:
            "Dziedziczenie w TypeScript realizowane jest przez słowo kluczowe extends. Klasa pochodna dziedziczy właściwości i metody klasy bazowej, może je nadpisywać i dodawać własne.",
          topic_id: data.topic_id,
          document_id: data.document_id,
          source: "ai",
          is_approved: false,
        },
      ];

      // Walidacja długości pól fiszek i skracanie jeśli potrzeba
      const validatedFlashcards = mockFlashcards.map((flashcard) => {
        // Walidacja długości front_original (max 200 znaków)
        if (flashcard.front_original.length > 200) {
          logger.warn(`Skrócono przód fiszki z ${flashcard.front_original.length} do 200 znaków`);
          flashcard.front_original = flashcard.front_original.substring(0, 197) + "...";
        }

        // Walidacja długości back_original (max 500 znaków)
        if (flashcard.back_original.length > 500) {
          logger.warn(`Skrócono tył fiszki z ${flashcard.back_original.length} do 500 znaków`);
          flashcard.back_original = flashcard.back_original.substring(0, 497) + "...";
        }

        return flashcard;
      });

      logger.debug(
        `Wygenerowano ${validatedFlashcards.length} fiszek${data.document_id ? ` dla dokumentu ${data.document_id}` : ""}`
      );

      // Zapisz wygenerowane fiszki w bazie danych
      await this.saveFlashcards(validatedFlashcards);

      return {
        flashcards: validatedFlashcards,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Nieznany błąd";
      logger.error(
        `Błąd podczas generowania fiszek${data.document_id ? ` dla dokumentu ${data.document_id}` : ""}: ${errorMessage}`,
        error
      );
      throw new Error(`Nie udało się wygenerować fiszek: ${errorMessage}`);
    }
  }

  async regenerateFlashcards(data: z.infer<typeof flashcardAiRegenerateSchema>): Promise<AiRegenerateResponseDto> {
    try {
      let textToProcess = data.text;
      let documentTopicId = data.topic_id;
      let deletedCount = 0;

      // Jeśli podano document_id, pobierz dokument i jego tekstową zawartość
      if (data.document_id) {
        logger.debug(`Regeneracja fiszek dla dokumentu: ${data.document_id}`);

        // Sprawdzenie istnienia dokumentu
        const { data: document, error: documentError } = await this.supabase
          .from("documents")
          .select("*")
          .eq("id", data.document_id)
          .single();

        if (documentError || !document) {
          throw new Error(`Nie znaleziono dokumentu o ID: ${data.document_id}`);
        }

        // Ustawienie tekstowej zawartości dokumentu jako źródło do generacji fiszek
        textToProcess = document.content;
        // Użyj topic_id z dokumentu, jeśli nie został jawnie przekazany
        documentTopicId = data.topic_id || document.topic_id || undefined;

        // Usunięcie wszystkich istniejących fiszek AI dla dokumentu
        const { data: deletedFlashcards, error: deleteError } = await this.supabase
          .from("flashcards")
          .delete()
          .eq("document_id", data.document_id)
          .eq("source", "ai")
          .select("id");

        if (deleteError) {
          throw new Error(`Błąd podczas usuwania istniejących fiszek: ${deleteError.message}`);
        }

        deletedCount = deletedFlashcards?.length || 0;
        logger.info(`Usunięto ${deletedCount} istniejących fiszek AI dla dokumentu ${data.document_id}`);
      }

      // Sprawdzenie czy text jest dostępny do przetworzenia
      if (!textToProcess) {
        throw new Error("Brak tekstu do przetworzenia. Podaj tekst lub poprawne ID dokumentu.");
      }

      // Wygenerowanie nowych fiszek z tekstu
      const aiGenerateDto: FlashcardAiGenerateDto = {
        text: textToProcess,
        topic_id: documentTopicId,
        document_id: data.document_id,
      };

      const generationResult = await this.generateFlashcards(aiGenerateDto);

      return {
        flashcards: generationResult.flashcards,
        deleted_count: deletedCount,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Nieznany błąd";
      logger.error(`Błąd podczas regeneracji fiszek: ${errorMessage}`, error);
      throw error;
    }
  }
}
