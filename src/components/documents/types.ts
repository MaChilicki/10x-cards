import type { DocumentDto, FlashcardDto, PaginationDto } from "@/types";

export interface DocumentsSortModel {
  sortBy: "name" | "created_at" | "updated_at";
  sortOrder: "asc" | "desc";
}

export interface DocumentsQueryModel extends DocumentsSortModel {
  page: number;
  limit: number;
}

export interface PaginationModel {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  availablePerPage: number[];
}

export interface DocumentViewModel extends DocumentDto {
  flashcards_count: number;
  ai_flashcards_count?: number;
  manual_flashcards_count?: number;
  isAiGenerated?: boolean;
}

export interface FlashcardsSortModel {
  sortBy: "front" | "created_at" | "updated_at" | "source";
  sortOrder: "asc" | "desc";
}

export interface DocumentDetailViewModel {
  document: DocumentDto | null;
  isLoadingDocument: boolean;
  documentError: string | null;
  unapprovedAiFlashcardsCount: number;
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

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  onConfirm: (() => void) | null;
}
