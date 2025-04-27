import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FileText, Trash2, Edit, Plus } from "lucide-react";
import type { DocumentViewModel, DocumentsSortModel } from "./types";
import { useNavigate } from "@/lib/hooks/use-navigate";
import { DocumentsSorter } from "./documents-sorter";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DocumentListProps {
  documents: DocumentViewModel[];
  isLoading: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    availablePerPage: number[];
  };
  onDelete: (document: DocumentViewModel) => void;
  onSort: (sort: DocumentsSortModel) => void;
  sort: DocumentsSortModel;
  onAddDocument: () => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
}

export function DocumentList({
  documents,
  isLoading,
  pagination,
  onDelete,
  onSort,
  sort,
  onAddDocument,
  onPageChange,
  onItemsPerPageChange,
}: DocumentListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <DocumentsSorter
          currentSort={sort}
          onChange={onSort}
          itemsPerPage={pagination.itemsPerPage}
          onItemsPerPageChange={onItemsPerPageChange}
        />
        <Button onClick={onAddDocument} className="gap-2 mb-6">
          <Plus className="h-4 w-4" />
          Dodaj dokument
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((document) => (
          <Card key={document.id} className="cursor-pointer hover:bg-accent/5">
            <CardHeader className="relative">
              <div className="absolute right-6 top-6 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/topics/${document.topic_id}/documents/${document.id}/edit`);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(document);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle
                className="cursor-pointer hover:underline"
                onClick={() => navigate(`/documents/${document.id}`)}
              >
                {document.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {document.isAiGenerated ? "Wygenerowany przez AI" : "Utworzony ręcznie"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    Fiszki:
                    {(document.ai_flashcards_count ?? 0) > 0 && (
                      <Badge className={cn("text-white bg-sky-700 hover:bg-sky-800")}>
                        AI: {document.ai_flashcards_count}
                      </Badge>
                    )}
                    {(document.manual_flashcards_count ?? 0) > 0 && (
                      <Badge className={cn("text-white bg-red-700 hover:bg-red-800")}>
                        Własne: {document.manual_flashcards_count}
                      </Badge>
                    )}
                    {(document.ai_flashcards_count ?? 0) <= 0 && (document.manual_flashcards_count ?? 0) <= 0 && (
                      <span>0</span>
                    )}
                  </div>
                  <div>Utworzono: {new Date(document.created_at).toLocaleDateString()}</div>
                  <div>Zaktualizowano: {new Date(document.updated_at).toLocaleDateString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={pagination.currentPage === 1}
              onClick={() => onPageChange(pagination.currentPage - 1)}
            >
              Poprzednia
            </Button>
            <span className="mx-4">
              Strona {pagination.currentPage} z {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => onPageChange(pagination.currentPage + 1)}
            >
              Następna
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
