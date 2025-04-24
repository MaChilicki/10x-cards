import { useEffect, useState } from "react";
import { useDocumentDetail } from "./hooks/use-document-detail";
import { useFlashcardsList } from "../flashcards/hooks/use-flashcards-list";
import { DocumentHeader } from "./document-header";
import { FlashcardsList, FlashcardsSorter } from "../flashcards";
import { Pagination } from "../ui/pagination";
import { Button } from "../ui/button";
import { ErrorAlert } from "../ui/error-alert";
import { useConfirmDialog } from "./hooks/use-confirm-dialog";
import { ConfirmDialog } from "../ui/confirm-dialog";
import type { FlashcardsSortModel } from "@/types";

interface DocumentDetailViewProps {
  documentId: string;
}

export function DocumentDetailView({ documentId }: DocumentDetailViewProps) {
  const {
    document,
    isLoadingDocument,
    documentError,
    unapprovedAiFlashcardsCount,
    actions: documentActions,
    refetch: refetchDocument,
  } = useDocumentDetail(documentId);

  const initialSort: FlashcardsSortModel = {
    sortBy: "created_at",
    sortOrder: "desc",
  };

  const {
    flashcards,
    isLoadingFlashcards,
    flashcardsError,
    pagination,
    actions: flashcardsActions,
    refetch: refetchFlashcards,
  } = useFlashcardsList(documentId, initialSort);

  const { actions: dialogActions, dialogState } = useConfirmDialog();
  const [actionError, setActionError] = useState<Error | null>(null);

  useEffect(() => {
    if (documentId) {
      refetchDocument();
      refetchFlashcards();
    }
    return undefined;
  }, [documentId, refetchDocument, refetchFlashcards]);

  const handleDeleteDocument = async () => {
    try {
      await documentActions.deleteDocument();
      window.location.href = "/documents";
    } catch (error) {
      setActionError(error instanceof Error ? error : new Error("Nieznany błąd podczas usuwania dokumentu"));
    }
  };

  const handleRegenerateFlashcards = async () => {
    try {
      await documentActions.regenerateFlashcards();
      window.location.href = `/documents/${documentId}/flashcards/approve`;
    } catch (error) {
      setActionError(error instanceof Error ? error : new Error("Nieznany błąd podczas regeneracji fiszek"));
    }
  };

  if (documentError) {
    return (
      <div className="flex flex-col items-center gap-4">
        <ErrorAlert message={`Błąd podczas ładowania dokumentu: ${documentError}`} />
        <Button variant="outline" onClick={refetchDocument}>
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  if (flashcardsError) {
    return (
      <div className="flex flex-col items-center gap-4">
        <ErrorAlert message={`Błąd podczas ładowania fiszek: ${flashcardsError}`} />
        <Button variant="outline" onClick={refetchFlashcards}>
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DocumentHeader
        document={document}
        breadcrumbs={[
          { id: "documents", name: "Dokumenty", href: "/documents" },
          { id: document?.topic_id || "", name: "Temat", href: `/topics/${document?.topic_id}` },
        ]}
        unapprovedCount={unapprovedAiFlashcardsCount}
        onBack={() => (window.location.href = "/documents")}
        onEdit={documentActions.editDocument}
        onDelete={() =>
          dialogActions.openDialog({
            title: "Usuń dokument",
            description: "Czy na pewno chcesz usunąć ten dokument? Tej operacji nie można cofnąć.",
            confirmText: "Usuń",
            onConfirm: handleDeleteDocument,
          })
        }
        onRegenerate={() =>
          dialogActions.openDialog({
            title: "Regeneruj fiszki",
            description:
              "Czy na pewno chcesz ponownie wygenerować fiszki dla tego dokumentu? Istniejące fiszki AI zostaną zastąpione.",
            confirmText: "Regeneruj",
            onConfirm: handleRegenerateFlashcards,
          })
        }
        isLoading={isLoadingDocument}
      />

      {actionError && (
        <div className="mt-4">
          <ErrorAlert message={actionError.message} />
        </div>
      )}

      <div className="mt-8">
        <FlashcardsSorter
          currentSort={initialSort}
          onChange={flashcardsActions.setSort}
          itemsPerPage={pagination?.limit || 24}
          onItemsPerPageChange={flashcardsActions.setItemsPerPage}
        />

        <FlashcardsList
          flashcards={flashcards}
          isLoading={isLoadingFlashcards}
          onEditFlashcard={flashcardsActions.editFlashcard}
          onDeleteFlashcard={(flashcardId) =>
            dialogActions.openDialog({
              title: "Usuń fiszkę",
              description: "Czy na pewno chcesz usunąć tę fiszkę? Tej operacji nie można cofnąć.",
              confirmText: "Usuń",
              onConfirm: () => flashcardsActions.deleteFlashcard(flashcardId),
            })
          }
        />

        {pagination && (
          <div className="mt-8">
            <Pagination
              currentPage={pagination.page}
              totalPages={Math.ceil(pagination.total / pagination.limit)}
              onPageChange={flashcardsActions.setPage}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        description={dialogState.description}
        confirmText={dialogState.confirmText}
        onConfirm={dialogActions.handleConfirm}
        onCancel={dialogActions.closeDialog}
      />
    </div>
  );
}
