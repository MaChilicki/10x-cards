import type { SupabaseClient } from "../../db/supabase.client";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import type { DocumentCreateDto, DocumentDto } from "../../types";
import { logger } from "./logger.service";

export class DocumentsService {
  constructor(private supabase: SupabaseClient) {}

  async createDocument(data: DocumentCreateDto): Promise<DocumentDto> {
    const { data: document, error } = await this.supabase
      .from("documents")
      .insert([
        {
          name: data.name,
          content: data.content,
          user_id: DEFAULT_USER_ID,
        },
      ])
      .select()
      .single();

    if (error) {
      logger.error("Błąd Supabase przy tworzeniu dokumentu:", error);
      throw new Error(`Błąd podczas tworzenia dokumentu: ${error.message}`);
    }

    this.triggerFlashcardsGeneration(document);
    return document;
  }

  private async triggerFlashcardsGeneration(document: DocumentDto): Promise<void> {
    try {
      logger.debug(`Zaplanowano generowanie fiszek dla dokumentu ${document.id}`);
      // TODO: Implementacja generowania fiszek
    } catch (error) {
      logger.error(`Błąd przy generowaniu fiszek dla dokumentu ${document.id}:`, error);
    }
  }
}
