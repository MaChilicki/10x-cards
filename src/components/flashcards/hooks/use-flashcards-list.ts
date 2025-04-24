import { useState, useCallback } from "react";
import type { FlashcardDto } from "@/types";
import type { FlashcardsSortModel, FlashcardsListViewModel } from "../types";
import { logger } from "@/lib/services/logger.service";

export function useFlashcardsList(documentId: string, initialSort: FlashcardsSortModel) {
  const [state, setState] = useState<FlashcardsListViewModel>({
    flashcards: [],
    pagination: null,
    isLoadingFlashcards: true,
    flashcardsError: null,
    currentPage: 1,
    currentSort: initialSort,
  });

  const fetchFlashcards = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoadingFlashcards: true, flashcardsError: null }));
    try {
      const queryParams = new URLSearchParams({
        document_id: documentId,
        page: state.currentPage.toString(),
        limit: (state.pagination?.limit || 24).toString(),
        sort_by: state.currentSort.sortBy,
        sort_order: state.currentSort.sortOrder,
        is_approved: "true",
        is_disabled: "false",
      });

      const response = await fetch(`/api/flashcards?${queryParams}`);
      if (!response.ok) {
        throw new Error("Nie udało się pobrać fiszek");
      }

      const { data: flashcards, pagination } = await response.json();
      setState((prev) => ({
        ...prev,
        flashcards,
        pagination,
        isLoadingFlashcards: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoadingFlashcards: false,
        flashcardsError: error instanceof Error ? error.message : "Nieznany błąd",
      }));
    }
  }, [documentId, state.currentPage, state.currentSort, state.pagination?.limit]);

  const setPage = (page: number) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  };

  const setSort = (sort: FlashcardsSortModel) => {
    setState((prev) => ({
      ...prev,
      currentSort: sort,
      currentPage: 1, // Reset do pierwszej strony przy zmianie sortowania
    }));
  };

  const setItemsPerPage = (limit: number) => {
    setState((prev) => ({
      ...prev,
      pagination: prev.pagination ? { ...prev.pagination, limit } : null,
      currentPage: 1, // Reset do pierwszej strony przy zmianie liczby elementów
    }));
  };

  const editFlashcard = async (flashcardId: string, updates: Partial<FlashcardDto>) => {
    try {
      const response = await fetch(`/api/flashcards/${flashcardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Nie udało się zaktualizować fiszki");
      }

      // Odśwież listę po edycji
      await fetchFlashcards();
    } catch (error) {
      logger.error("Błąd podczas aktualizacji fiszki:", error);
      throw error;
    }
  };

  const deleteFlashcard = async (flashcardId: string) => {
    try {
      const response = await fetch(`/api/flashcards/${flashcardId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Nie udało się usunąć fiszki");
      }

      // Odśwież listę po usunięciu
      await fetchFlashcards();
    } catch (error) {
      logger.error("Błąd podczas usuwania fiszki:", error);
      throw error;
    }
  };

  return {
    ...state,
    actions: {
      setPage,
      setSort,
      setItemsPerPage,
      editFlashcard,
      deleteFlashcard,
    },
    refetch: fetchFlashcards,
  };
}
