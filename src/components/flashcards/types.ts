import type { FlashcardDto, PaginationDto } from "@/types";

export interface FlashcardsSortModel {
  sortBy: "front" | "created_at" | "updated_at" | "source";
  sortOrder: "asc" | "desc";
}

export interface FlashcardsListViewModel {
  flashcards: FlashcardDto[];
  pagination: PaginationDto | null;
  isLoadingFlashcards: boolean;
  flashcardsError: string | null;
  currentPage: number;
  currentSort: FlashcardsSortModel;
}

export interface FlashcardFormViewModel {
  front: string;
  back: string;
  errors: { front?: string; back?: string };
  isSubmitting: boolean;
}
