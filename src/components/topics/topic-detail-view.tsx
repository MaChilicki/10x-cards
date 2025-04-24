import { useState, useEffect } from "react";
import { useTopicDetail } from "./hooks/use-topic-detail";
import { useDocumentsList } from "@/components/documents/hooks/use-documents-list";
import { TopicHeader } from "./topic-header";
import { DocumentList } from "@/components/documents/document-list";
import { EmptyState } from "@/components/documents/empty-state";
import { ConfirmDeleteModal } from "@/components/documents/confirm-delete-modal";
import { DocumentsPerPageSelect } from "@/components/documents/documents-per-page-select";
import type { DocumentViewModel } from "@/components/documents/types";
import type { DocumentsSortModel } from "@/components/documents/hooks/use-documents-list";
import { ErrorAlert } from "@/components/ui/error-alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@/lib/hooks/use-navigate";
import { logger } from "@/lib/services/logger.service";

interface TopicDetailViewProps {
  /** ID tematu do wyświetlenia */
  topicId: string;
}

type PerPageValue = 12 | 24 | 36;

const TopicDetailView = ({ topicId }: React.ComponentProps<"div"> & TopicDetailViewProps) => {
  const navigate = useNavigate();
  const { topic, isLoading: isTopicLoading, error: topicError, refetch: refetchTopic } = useTopicDetail(topicId);

  const {
    documents,
    isLoading: isDocumentsLoading,
    error: documentsError,
    pagination,
    refetch: refetchDocuments,
    setPage,
    setPerPage,
    sort,
    updateSort,
  } = useDocumentsList(topicId);

  const [documentToDelete, setDocumentToDelete] = useState<DocumentViewModel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<Error | null>(null);

  const updateUrlParams = (params: Record<string, string>): void => {
    const searchParams = new URLSearchParams(window.location.search);
    Object.entries(params).forEach(([key, value]) => {
      searchParams.set(key, value);
    });
    navigate(`?${searchParams.toString()}`, { replace: true });
  };

  const handleSort = (newSort: DocumentsSortModel): void => {
    updateSort(newSort);
    setPage(1); // Reset strony przy zmianie sortowania
    updateUrlParams({
      sort_by: newSort.sortBy,
      sort_order: newSort.sortOrder,
      page: "1",
    });
  };

  const handlePageChange = (page: number): void => {
    setPage(page);
    updateUrlParams({ page: page.toString() });
  };

  const handlePerPageChange = (perPage: PerPageValue): void => {
    setPerPage(perPage);
    setPage(1); // Reset strony przy zmianie liczby elementów
    updateUrlParams({
      per_page: perPage.toString(),
      page: "1",
    });
  };

  const handleAddDocument = (): void => {
    navigate(`/topics/${topicId}/documents/new`);
  };

  const handleDeleteDocument = (document: DocumentViewModel): void => {
    setDocumentToDelete(document);
    setDeleteError(null);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!documentToDelete) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);
      const response = await fetch(`/api/documents/${documentToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Nie udało się usunąć dokumentu");
      }

      setDocumentToDelete(null);
      refetchDocuments();
      refetchTopic();
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Wystąpił nieoczekiwany błąd");
      logger.error("Błąd podczas usuwania dokumentu:", err);
      setDeleteError(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Inicjalizacja parametrów z URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get("page");
    const perPage = params.get("per_page");
    const sortBy = params.get("sort_by");
    const sortOrder = params.get("sort_order");

    if (page) {
      const pageNum = parseInt(page, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        setPage(pageNum);
      }
    }

    if (perPage) {
      const perPageValue = parseInt(perPage, 10) as PerPageValue;
      if ([12, 24, 36].includes(perPageValue)) {
        setPerPage(perPageValue);
      }
    }

    if (sortBy && sortOrder) {
      if (["name", "created_at", "updated_at"].includes(sortBy) && ["asc", "desc"].includes(sortOrder)) {
        updateSort({
          sortBy: sortBy as DocumentsSortModel["sortBy"],
          sortOrder: sortOrder as DocumentsSortModel["sortOrder"],
        });
      }
    }

    return () => undefined;
  }, [setPage, setPerPage, updateSort]); // Dodajemy zależności

  if (topicError) {
    return (
      <div className="flex flex-col items-center gap-4">
        <ErrorAlert message="Wystąpił błąd podczas ładowania tematu" />
        <Button variant="outline" onClick={refetchTopic}>
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  if (isTopicLoading) {
    return <LoadingSpinner />;
  }

  if (!topic) {
    return <ErrorAlert message="Nie znaleziono tematu" />;
  }

  if (documentsError) {
    return (
      <div className="flex flex-col items-center gap-4">
        <ErrorAlert message="Wystąpił błąd podczas ładowania dokumentów" />
        <Button variant="outline" onClick={refetchDocuments}>
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TopicHeader topic={topic} onBack={() => navigate("/topics")} />

      {documents.length === 0 && !isDocumentsLoading ? (
        <EmptyState topicId={topicId} />
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <DocumentsPerPageSelect value={pagination.itemsPerPage as PerPageValue} onChange={handlePerPageChange} />
          </div>
          <DocumentList
            documents={documents}
            isLoading={isDocumentsLoading}
            pagination={pagination}
            onDelete={handleDeleteDocument}
            onSort={handleSort}
            sort={sort}
            onAddDocument={handleAddDocument}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <ConfirmDeleteModal
        isOpen={!!documentToDelete}
        document={documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  );
};

export default TopicDetailView;
