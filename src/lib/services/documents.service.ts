import type { SupabaseClient } from "../../db/supabase.client";
import { DEFAULT_USER_ID, DEFAULT_TOPIC_ID } from "../../db/supabase.client";
import type { DocumentCreateDto, DocumentDto } from "../../types";
import { logger } from "./logger.service";
import { AiGenerateService } from "./ai-generate.service";
import { FlashcardsService } from "./flashcards.service";

export class DocumentsService {
  private aiService: AiGenerateService;
  private flashcardsService: FlashcardsService;

  constructor(private supabase: SupabaseClient) {
    this.aiService = new AiGenerateService(supabase);
    this.flashcardsService = new FlashcardsService(supabase);
  }

  async createDocument(data: DocumentCreateDto): Promise<DocumentDto> {
    const topicId = (data.topic_id === null || data.topic_id === undefined) ? DEFAULT_TOPIC_ID : data.topic_id;

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

    try {
      const { error: topicError } = await this.supabase
        .from("document_topics")
        .insert([
          {
            document_id: document.id,
            topic_id: topicId,
          },
        ]);

      if (topicError) {
        throw new Error(`Błąd podczas przypisywania dokumentu do tematu: ${topicError.message}`);
      }

      await this.triggerFlashcardsGeneration(document, topicId);
      return document;
    } catch (error) {
      // W przypadku błędu usuwamy utworzony dokument
      logger.error("Błąd przy tworzeniu powiązań lub generowaniu fiszek:", error);
      await this.supabase.from("documents").delete().eq("id", document.id);
      throw error;
    }
  }

  private async triggerFlashcardsGeneration(document: DocumentDto, topicId: string): Promise<void> {
    try {
      logger.debug(`Rozpoczęto generowanie fiszek dla dokumentu ${document.id} w temacie ${topicId}`);
      
      const result = await this.aiService.generateFlashcards({
        text: document.content,
        document_id: document.id,
        topic_id: topicId
      });

      // Ustawiamy topic_id dla każdej fiszki i upewniamy się, że is_approved jest ustawione
      const flashcardsWithTopic = result.flashcards.map(flashcard => ({
        ...flashcard,
        topic_id: topicId,
        is_approved: flashcard.is_approved === undefined ? false : flashcard.is_approved
      }));

      // Przekazujemy user_id z dokumentu do serwisu fiszek
      await this.flashcardsService.createFlashcards(flashcardsWithTopic, document.user_id);
      
      logger.info(`Pomyślnie wygenerowano i zapisano fiszki dla dokumentu ${document.id} w temacie ${topicId}`);
    } catch (error) {
      logger.error(`Błąd przy generowaniu fiszek dla dokumentu ${document.id}:`, error);
      throw error;
    }
  }
}