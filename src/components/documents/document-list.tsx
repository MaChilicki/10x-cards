import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FileText, Trash2, Edit, Plus } from "lucide-react";
import type { DocumentViewModel } from "./types";
import { useNavigate } from "@/lib/hooks/use-navigate";
import type { DocumentsSortModel } from "./hooks/use-documents-list";

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
}: DocumentListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Select
            value={sort.sortBy}
            onValueChange={(value) => onSort({ ...sort, sortBy: value as DocumentsSortModel["sortBy"] })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sortuj według" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nazwa</SelectItem>
              <SelectItem value="created_at">Data utworzenia</SelectItem>
              <SelectItem value="updated_at">Data aktualizacji</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sort.sortOrder}
            onValueChange={(value) => onSort({ ...sort, sortOrder: value as DocumentsSortModel["sortOrder"] })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Kierunek sortowania" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Rosnąco</SelectItem>
              <SelectItem value="desc">Malejąco</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onAddDocument} className="gap-2">
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
                <div>Fiszki: {document.flashcards_count}</div>
                <div>Utworzono: {new Date(document.created_at).toLocaleDateString()}</div>
                <div>Zaktualizowano: {new Date(document.updated_at).toLocaleDateString()}</div>
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
