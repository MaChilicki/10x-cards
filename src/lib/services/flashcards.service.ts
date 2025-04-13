import type { SupabaseClient } from "../../db/supabase.client";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import type { FlashcardProposalDto } from "../../types";
import { logger } from "./logger.service";

export class FlashcardsService {
  constructor(private supabase: SupabaseClient) {}

  async createFlashcards(flashcards: FlashcardProposalDto[], user_id?: string): Promise<void> {
    try {
      // Używamy przekazanego user_id lub DEFAULT_USER_ID jako fallback
      const userId = user_id || DEFAULT_USER_ID;
      
      const { error } = await this.supabase
        .from("flashcards")
        .insert(
          flashcards.map(flashcard => ({
            ...flashcard,
            user_id: userId,
            is_modified: false,
            is_disabled: false
          }))
        );

      if (error) {
        logger.error("Błąd Supabase przy tworzeniu fiszek:", error);
        throw new Error(`Błąd podczas tworzenia fiszek: ${error.message}`);
      }

      logger.info(`Pomyślnie utworzono ${flashcards.length} fiszek dla użytkownika ${userId}`);
    } catch (error) {
      logger.error("Błąd podczas tworzenia fiszek:", error);
      throw new Error("Nie udało się utworzyć fiszek");
    }
  }
} 