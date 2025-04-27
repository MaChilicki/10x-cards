import React, { useEffect } from "react";
import { useFlashcardsApproval } from "./hooks/use-flashcards-approval";
import { DocumentHeader } from "@/components/documents/document-header";
import { BulkActionsBar } from "@/components/flashcards/bulk-actions-bar";
import { FlashcardsSorter } from "./flashcards-sorter";
import { FlashcardsList } from "./flashcards-list";
import { EditFlashcardModal } from "./flashcard-edit-modal";
import { ConfirmationDialog } from "../ui/confirmation-dialog";
import { LoadingSpinner } from "../ui/loading-spinner";
import { ErrorAlert } from "../ui/error-alert";
import { EmptyState } from "@/components/ui/empty-state";

interface FlashcardsApprovalViewProps {
  documentId: string;
}

export function FlashcardsApprovalView({ documentId }: FlashcardsApprovalViewProps) {
  const {
    // Stan
    document,
    isLoadingDocument,
    documentError,
    flashcards,
    isLoadingFlashcards,
    flashcardsError,
    pagination,
    sort,
    selectedFlashcards,
    selectedCount,
    allSelected,
    editModalState,
    confirmDialogState,

    // Akcje
    actions,

    // Efekty
    fetchDocument,
    fetchFlashcards,
  } = useFlashcardsApproval(documentId);

  // Efekt pobierający dane przy montowaniu komponentu
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchDocument(), fetchFlashcards()]);
    };
    void fetchData();
    return undefined;
  }, [fetchDocument, fetchFlashcards]);

  // Efekt odświeżający fiszki przy zmianie sortowania lub paginacji
  useEffect(() => {
    const refreshFlashcards = async () => {
      await fetchFlashcards();
    };
    void refreshFlashcards();
    return undefined;
  }, [fetchFlashcards, sort, pagination.currentPage, pagination.itemsPerPage]);

  // Obsługa stanu ładowania dokumentu
  if (isLoadingDocument) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-muted-foreground">Ładowanie dokumentu...</p>
      </div>
    );
  }

  // Obsługa błędu ładowania dokumentu
  if (documentError) {
    return (
      <ErrorAlert title="Błąd ładowania" message={`Nie udało się załadować dokumentu: ${documentError.message}`} />
    );
  }

  // Obsługa błędu ładowania fiszek
  if (flashcardsError) {
    return <ErrorAlert title="Błąd ładowania" message={`Nie udało się załadować fiszek: ${flashcardsError.message}`} />;
  }

  // Obsługa braku dokumentu
  if (!document) {
    return (
      <EmptyState
        message="Nie znaleziono dokumentu"
        actionText="Powrót do listy dokumentów"
        onAction={() => (window.location.href = "/documents")}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <DocumentHeader
          document={document}
          unapprovedCount={document.pending_flashcards_count || 0}
          aiFlashcardsCount={document.ai_flashcards_count || 0}
          manualFlashcardsCount={document.manual_flashcards_count || 0}
          isLoading={isLoadingDocument}
          showActions={false}
          onBack={() => (window.location.href = `/documents/${document.id}`)}
          showApprovalBreadcrumb
        />

        <BulkActionsBar
          selectedCount={selectedCount}
          totalCount={flashcards.length}
          allSelected={allSelected}
          onSelectAll={actions.handleSelectAll}
          onApproveSelected={actions.approveSelectedFlashcards}
          onApproveAll={actions.approveAllFlashcards}
          isLoading={isLoadingFlashcards}
          selectedFlashcards={flashcards.filter((f) => selectedFlashcards[f.id])}
          allFlashcards={flashcards}
        />

        <FlashcardsSorter
          currentSort={sort}
          onChange={actions.handleSortChange}
          itemsPerPage={pagination.itemsPerPage}
          onItemsPerPageChange={actions.handleItemsPerPageChange}
        />

        <FlashcardsList
          flashcards={flashcards}
          isLoading={isLoadingFlashcards}
          mode="approve"
          selectedFlashcards={selectedFlashcards}
          pagination={pagination}
          onEditFlashcard={async (id, updates) => {
            const existingFlashcard = flashcards.find((f) => f.id === id);
            if (!existingFlashcard) {
              throw new Error(`Nie znaleziono fiszki o ID: ${id}`);
            }
            await actions.handleEditFlashcard({
              ...existingFlashcard,
              ...updates,
              is_modified: true,
            });
          }}
          onDeleteFlashcard={actions.handleDeleteFlashcard}
          onPageChange={actions.handlePageChange}
          onToggleSelect={actions.handleToggleSelect}
          onApproveFlashcard={async (id) => {
            const flashcard = flashcards.find((f) => f.id === id);
            if (!flashcard) return;

            return new Promise<void>((resolve) => {
              actions.showConfirmDialog(
                "Zatwierdź fiszkę",
                `Czy na pewno chcesz zatwierdzić tę fiszkę?<br/><br/>
                <div class="space-y-4">
                  <div>
                    <strong>Przód:</strong>
                    <div class="mt-2 rounded-lg border border-border bg-muted/50 p-3">
                      ${flashcard.front_modified}
                    </div>
                  </div>
                  <div>
                    <strong>Tył:</strong>
                    <div class="mt-2 rounded-lg border border-border bg-muted/50 p-3">
                      ${flashcard.back_modified}
                    </div>
                  </div>
                </div>`,
                async () => {
                  await actions.approveFlashcard(id);
                  resolve();
                },
                "Zatwierdź"
              );
            });
          }}
        />
      </div>

      <EditFlashcardModal
        isOpen={editModalState.isOpen}
        onClose={actions.handleCloseEdit}
        onSubmit={(data) => actions.handleSaveEdit(editModalState.flashcard?.id || "", data)}
        flashcard={editModalState.flashcard}
        isSubmitting={editModalState.isSubmitting}
        mode="edit"
      />

      <ConfirmationDialog
        isOpen={confirmDialogState.isOpen}
        title={confirmDialogState.title}
        description={confirmDialogState.description}
        confirmText={confirmDialogState.confirmText}
        onConfirm={confirmDialogState.onConfirm ?? (() => Promise.resolve())}
        onClose={actions.closeConfirmDialog}
      />
    </div>
  );
}
