import type { SupabaseClient } from "../../db/supabase.client";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import type { FlashcardAiGenerateDto, FlashcardAiResponse, FlashcardProposalDto } from "../../types";
import { logger } from "./logger.service";
import { FlashcardsService } from "./flashcards.service";

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

      logger.debug(
        `Wygenerowano ${mockFlashcards.length} fiszek${data.document_id ? ` dla dokumentu ${data.document_id}` : ""}`
      );

      // Zapisz wygenerowane fiszki w bazie danych
      await this.saveFlashcards(mockFlashcards);

      return {
        flashcards: mockFlashcards,
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
}
