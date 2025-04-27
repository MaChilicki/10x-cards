import { useEffect, useState } from "react";
import { useDocumentDetail } from "./hooks/use-document-detail";
import { useFlashcardsList } from "../flashcards/hooks/use-flashcards-list";
import { DocumentHeader } from "./document-header";
import { FlashcardsList, FlashcardsSorter } from "../flashcards";
import { Button } from "../ui/button";
import { ErrorAlert } from "../ui/error-alert";
import { useConfirmDialog } from "./hooks/use-confirm-dialog";
import { ConfirmDialog } from "../ui/confirm-dialog";
import { EditFlashcardModal } from "../flashcards/flashcard-edit-modal";
import { Plus } from "lucide-react";
import type { FlashcardsSortModel } from "../flashcards/types";
import type { FlashcardDto, FlashcardCreateDto, FlashcardsListResponseDto, AiRegenerateResponseDto } from "@/types";
import { logger } from "@/lib/services/logger.service";

interface DocumentDetailViewProps {
  documentId: string;
}

export function DocumentDetailView({ documentId }: DocumentDetailViewProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddingFlashcard, setIsAddingFlashcard] = useState(false);

  const {
    document,
    isLoadingDocument,
    documentError,
    actions: documentActions,
    refetch: refetchDocument,
  } = useDocumentDetail(documentId);

  const initialSort: FlashcardsSortModel = {
    sortBy: "created_at",
    sortOrder: "desc",
  };

  const {
    flashcards,
    isLoading,
    error,
    pagination,
    setPage,
    setItemsPerPage,
    sort,
    updateSort,
    refetch: refetchFlashcards,
  } = useFlashcardsList({
    documentId,
    initialSort,
    initialPage: 1,
    initialItemsPerPage: 24,
    is_approved: true,
    is_disabled: false,
  });

  const { actions: dialogActions, dialogState } = useConfirmDialog();
  const [actionError, setActionError] = useState<Error | null>(null);

  useEffect(() => {
    if (documentId) {
      refetchDocument();
      refetchFlashcards();
    }
    return undefined;
  }, [documentId, refetchDocument, refetchFlashcards]);

  const handleAddFlashcard = async (data: FlashcardCreateDto) => {
    setIsAddingFlashcard(true);
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flashcards: [
            {
              front_original: data.front_original,
              back_original: data.back_original,
              document_id: documentId,
              source: "manual",
              is_approved: true,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Nie udało się dodać fiszki");
      }

      setIsAddModalOpen(false);
      await Promise.all([refetchFlashcards(), refetchDocument()]);
    } catch (error) {
      logger.error("Błąd podczas dodawania fiszki:", error);
      throw error;
    } finally {
      setIsAddingFlashcard(false);
    }
  };

  const handleEditFlashcard = async (flashcardId: string, updates: Partial<FlashcardDto>) => {
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

      await Promise.all([refetchFlashcards(), refetchDocument()]);
    } catch (error) {
      logger.error("Błąd podczas edycji fiszki:", error);
      throw error;
    }
  };

  const handleDeleteFlashcard = async (flashcardId: string) => {
    const flashcard = flashcards.find((f) => f.id === flashcardId);
    if (!flashcard) {
      throw new Error(`Nie znaleziono fiszki o ID: ${flashcardId}`);
    }

    return new Promise<void>((resolve, reject) => {
      dialogActions.openDialog({
        title: "Usuń fiszkę",
        description: "Czy na pewno chcesz usunąć tę fiszkę? Tej operacji nie można cofnąć.",
        confirmText: "Usuń",
        onConfirm: async () => {
          try {
            const response = await fetch(`/api/flashcards/${flashcardId}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ source: flashcard.source }),
            });

            if (!response.ok) {
              throw new Error("Nie udało się usunąć fiszki");
            }

            await Promise.all([refetchFlashcards(), refetchDocument()]);
            resolve();
          } catch (error) {
            reject(error);
          }
        },
      });
    });
  };

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
      // Otwórz dialog od razu, pokazując spinner ładowania
      dialogActions.openDialog({
        title: "Regeneruj fiszki AI",
        description: `
          <div class="space-y-4">
            <div class="flex items-center justify-center p-4">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span class="ml-2">Pobieranie fiszek...</span>
            </div>
          </div>
        `,
        confirmText: "Regeneruj",
        dangerousHTML: true,
        onConfirm: async () => {
          try {
            const response = await fetch("/api/flashcards/ai-regenerate", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                document_id: documentId,
              }),
            });

            if (!response.ok) {
              throw new Error("Nie udało się zregenerować fiszek");
            }

            const result: AiRegenerateResponseDto = await response.json();
            logger.info(`Usunięto ${result.deleted_count} fiszek i wygenerowano ${result.flashcards.length} nowych`);

            // Przekierowanie do widoku zatwierdzania
            window.location.href = `/documents/${documentId}/flashcards/approve`;
          } catch (error) {
            logger.error("Błąd podczas regeneracji fiszek:", error);
            setActionError(error instanceof Error ? error : new Error("Nieznany błąd podczas regeneracji fiszek"));
          }
        },
      });

      // Pobierz fiszki AI
      try {
        const params = new URLSearchParams({
          document_id: documentId,
          source: "ai",
          is_disabled: "false",
        });

        const response = await fetch(`/api/flashcards?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Nie udało się pobrać fiszek AI");
        }

        const data: FlashcardsListResponseDto = await response.json();

        // Aktualizuj dialog po pobraniu fiszek
        const dialogContent = `
          <div class="space-y-4">
            <p class="text-base">Czy na pewno chcesz zregenerować fiszki AI? Ta operacja:</p>
            <ul class="list-disc list-inside space-y-2">
              <li>Usunie wszystkie istniejące fiszki AI (${data.data.length})</li>
              <li>Wygeneruje nowe fiszki na podstawie treści dokumentu</li>
            </ul>
            ${
              data.data.length > 0
                ? `
              <div class="mt-4">
                <p class="font-semibold mb-2">Istniejące fiszki AI:</p>
                <div class="space-y-2 max-h-60 overflow-y-auto">
                  ${data.data
                    .map(
                      (flashcard, index) => `
                    <div class="p-3 bg-muted rounded-lg">
                      <p class="text-sm font-medium text-muted-foreground">${index + 1}. ${flashcard.front_modified || flashcard.front_original}</p>
                      <div class="flex gap-2 mt-1">
                        ${
                          flashcard.is_approved
                            ? '<span class="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">Zatwierdzona</span>'
                            : '<span class="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">Niezatwierdzona</span>'
                        }
                        ${
                          flashcard.is_disabled
                            ? '<span class="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">Wyłączona</span>'
                            : ""
                        }
                      </div>
                    </div>
                  `
                    )
                    .join("")}
                </div>
              </div>
            `
                : ""
            }
          </div>
        `;

        // Aktualizuj dialog z listą fiszek
        dialogActions.openDialog({
          title: "Regeneruj fiszki AI",
          description: dialogContent,
          confirmText: "Regeneruj",
          dangerousHTML: true,
          onConfirm: async () => {
            try {
              const response = await fetch("/api/flashcards/ai-regenerate", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  document_id: documentId,
                }),
              });

              if (!response.ok) {
                throw new Error("Nie udało się zregenerować fiszek");
              }

              const result: AiRegenerateResponseDto = await response.json();
              logger.info(`Usunięto ${result.deleted_count} fiszek i wygenerowano ${result.flashcards.length} nowych`);

              // Przekierowanie do widoku zatwierdzania
              window.location.href = `/documents/${documentId}/flashcards/approve`;
            } catch (error) {
              logger.error("Błąd podczas regeneracji fiszek:", error);
              setActionError(error instanceof Error ? error : new Error("Nieznany błąd podczas regeneracji fiszek"));
            }
          },
        });
      } catch (error) {
        // Obsługa błędu pobierania fiszek
        logger.error("Błąd podczas pobierania fiszek AI:", error);

        // Aktualizuj dialog z informacją o błędzie
        dialogActions.openDialog({
          title: "Błąd",
          description: "Nie udało się pobrać istniejących fiszek AI. Czy chcesz kontynuować regenerację?",
          confirmText: "Kontynuuj",
          onConfirm: async () => {
            try {
              const response = await fetch("/api/flashcards/ai-regenerate", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  document_id: documentId,
                }),
              });

              if (!response.ok) {
                throw new Error("Nie udało się zregenerować fiszek");
              }

              const result: AiRegenerateResponseDto = await response.json();
              logger.info(`Usunięto ${result.deleted_count} fiszek i wygenerowano ${result.flashcards.length} nowych`);

              // Przekierowanie do widoku zatwierdzania
              window.location.href = `/documents/${documentId}/flashcards/approve`;
            } catch (error) {
              logger.error("Błąd podczas regeneracji fiszek:", error);
              setActionError(error instanceof Error ? error : new Error("Nieznany błąd podczas regeneracji fiszek"));
            }
          },
        });
      }
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

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4">
        <ErrorAlert message={`Błąd podczas ładowania fiszek: ${error.message}`} />
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
          { id: "topics", name: "Tematy", href: "/topics" },
          {
            id: document?.topic_id || "",
            name: document?.topic_title || "Temat",
            href: `/topics/${document?.topic_id}`,
          },
        ]}
        unapprovedCount={document?.pending_flashcards_count || 0}
        aiFlashcardsCount={document?.ai_flashcards_count || 0}
        manualFlashcardsCount={document?.manual_flashcards_count || 0}
        onBack={() => (window.location.href = `/topics/${document?.topic_id}`)}
        onEdit={documentActions.editDocument}
        onDelete={() =>
          dialogActions.openDialog({
            title: "Usuń dokument",
            description: "Czy na pewno chcesz usunąć ten dokument? Tej operacji nie można cofnąć.",
            confirmText: "Usuń",
            onConfirm: handleDeleteDocument,
          })
        }
        onRegenerate={handleRegenerateFlashcards}
        isLoading={isLoadingDocument}
      />

      {actionError && (
        <div className="mt-4">
          <ErrorAlert message={actionError.message} />
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <FlashcardsSorter
            currentSort={sort}
            onChange={updateSort}
            itemsPerPage={pagination?.itemsPerPage || 24}
            onItemsPerPageChange={setItemsPerPage}
          />
          <Button onClick={() => setIsAddModalOpen(true)} className="mb-6">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj fiszkę ręcznie
          </Button>
        </div>

        <FlashcardsList
          flashcards={flashcards}
          isLoading={isLoading}
          mode="view"
          pagination={
            pagination || {
              currentPage: 1,
              totalPages: 1,
              totalItems: 0,
              itemsPerPage: 24,
            }
          }
          onEditFlashcard={handleEditFlashcard}
          onDeleteFlashcard={handleDeleteFlashcard}
          onPageChange={setPage}
        />
      </div>

      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        description={dialogState.description}
        confirmText={dialogState.confirmText}
        dangerousHTML={dialogState.dangerousHTML}
        onConfirm={dialogActions.handleConfirm}
        onCancel={dialogActions.closeDialog}
      />

      <EditFlashcardModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (data) => {
          if ("source" in data) {
            await handleAddFlashcard({
              ...data,
              document_id: documentId,
            });
          }
        }}
        isSubmitting={isAddingFlashcard}
        mode="add"
      />
    </div>
  );
}
