import type { DocumentDto } from "@/types";

export interface DocumentViewModel extends DocumentDto {
  flashcards_count: number;
  isAiGenerated?: boolean;
}

export interface DocumentsSortModel {
  sortBy: "name" | "created_at" | "updated_at";
  sortOrder: "asc" | "desc";
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
