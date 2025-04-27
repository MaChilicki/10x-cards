import { useState, useEffect, useCallback } from "react";
import type { FlashcardDto } from "@/types";
import type { FlashcardsSortModel } from "../types";
import { logger } from "@/lib/services/logger.service";

interface UseFlashcardsListProps {
  documentId: string;
  topicId?: string;
  initialSort?: FlashcardsSortModel;
  initialPage?: number;
  initialItemsPerPage?: number;
  is_approved?: boolean;
  is_disabled?: boolean;
}

interface FlashcardsResponse {
  data: FlashcardDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const getSortQueryParam = (sort: FlashcardsSortModel): string => {
  const prefix = sort.sortOrder === "desc" ? "-" : "";
  return `${prefix}${sort.sortBy}`;
};

export function useFlashcardsList({
  documentId,
  topicId,
  initialSort = { sortBy: "created_at", sortOrder: "desc" },
  initialPage = 1,
  initialItemsPerPage = 12,
  is_approved,
  is_disabled,
}: UseFlashcardsListProps) {
  const [flashcards, setFlashcards] = useState<FlashcardDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [sort, setSort] = useState<FlashcardsSortModel>(initialSort);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: initialItemsPerPage,
  });

  const fetchFlashcards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        sort: getSortQueryParam(sort),
        document_id: documentId,
      });

      if (topicId) {
        queryParams.append("topic_id", topicId);
      }

      if (is_approved !== undefined) {
        queryParams.append("is_approved", is_approved ? "true" : "false");
      }

      if (is_disabled !== undefined) {
        queryParams.append("is_disabled", is_disabled ? "true" : "false");
      }

      const queryString = queryParams.toString();
      logger.debug(`Pobieranie fiszek z parametrami: ${queryString}`);

      const response = await fetch(`/api/flashcards?${queryString}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Nie udało się pobrać fiszek");
      }

      const data: FlashcardsResponse = await response.json();
      logger.debug(`Otrzymano ${data.data.length} fiszek z ${data.pagination.total} dostępnych`);

      setFlashcards(data.data);
      setPagination({
        currentPage: data.pagination.page,
        totalPages: Math.ceil(data.pagination.total / data.pagination.limit),
        totalItems: data.pagination.total,
        itemsPerPage: data.pagination.limit,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Wystąpił nieoczekiwany błąd");
      logger.error("Błąd podczas pobierania fiszek:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [documentId, topicId, page, itemsPerPage, sort, is_approved, is_disabled]);

  useEffect(() => {
    void fetchFlashcards();
    return undefined;
  }, [fetchFlashcards]);

  const updateSort = (newSort: FlashcardsSortModel) => {
    setSort(newSort);
    setPage(1);
  };

  return {
    flashcards,
    isLoading,
    error,
    pagination,
    refetch: fetchFlashcards,
    setPage,
    setItemsPerPage,
    sort,
    updateSort,
  };
}
