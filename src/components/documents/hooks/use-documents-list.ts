import { useState, useEffect, useCallback } from "react";
import type { DocumentViewModel } from "../types";
import type { DocumentDto } from "@/types";

export interface DocumentsSortModel {
  sortBy: "name" | "created_at" | "updated_at";
  sortOrder: "asc" | "desc";
}

interface UseDocumentsListOptions {
  sortBy?: DocumentsSortModel["sortBy"];
  sortOrder?: DocumentsSortModel["sortOrder"];
  initialPage?: number;
  initialPerPage?: number;
}

const DEFAULT_OPTIONS: Required<UseDocumentsListOptions> = {
  sortBy: "created_at",
  sortOrder: "desc",
  initialPage: 1,
  initialPerPage: 24, // Domyślna wartość z DocumentsPerPageSelect
};

export function useDocumentsList(topicId: string, options: UseDocumentsListOptions = {}) {
  const {
    sortBy = DEFAULT_OPTIONS.sortBy,
    sortOrder = DEFAULT_OPTIONS.sortOrder,
    initialPage = DEFAULT_OPTIONS.initialPage,
    initialPerPage = DEFAULT_OPTIONS.initialPerPage,
  } = options;

  const [documents, setDocuments] = useState<DocumentViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [perPage, setPerPage] = useState(initialPerPage);
  const [sort, setSort] = useState<DocumentsSortModel>({ sortBy, sortOrder });
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: initialPerPage,
    availablePerPage: [12, 24, 36], // Wartości z DocumentsPerPageSelect
  });

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        topic_id: topicId,
        sort: `${sort.sortOrder === "desc" ? "-" : ""}${sort.sortBy}`,
        page: page.toString(),
        per_page: perPage.toString(),
      });

      const response = await fetch(`/api/documents?${queryParams}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Nie udało się pobrać dokumentów");
      }

      const data = await response.json();

      setDocuments(
        data.documents.map((doc: DocumentDto) => ({
          ...doc,
          flashcards_count: doc.flashcards?.length ?? 0,
          isAiGenerated: !!doc.is_ai_generated,
        }))
      );

      setPagination((prev) => ({
        ...prev,
        currentPage: page,
        totalItems: data.total,
        totalPages: Math.ceil(data.total / perPage),
        itemsPerPage: perPage,
      }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Wystąpił nieoczekiwany błąd"));
    } finally {
      setIsLoading(false);
    }
  }, [topicId, page, perPage, sort.sortBy, sort.sortOrder]);

  useEffect(() => {
    if (topicId) {
      void fetchDocuments();
    }
    return undefined;
  }, [topicId, page, perPage, sort.sortBy, sort.sortOrder, fetchDocuments]);

  const updateSort = (newSort: Partial<DocumentsSortModel>) => {
    setSort((prev) => ({ ...prev, ...newSort }));
  };

  return {
    documents,
    isLoading,
    error,
    pagination,
    sort,
    updateSort,
    setPage,
    setPerPage,
    refetch: fetchDocuments,
  };
}
