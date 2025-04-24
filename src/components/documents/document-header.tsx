import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { DocumentActions } from "./document-actions";
import type { DocumentDto } from "@/types";

interface BreadcrumbItem {
  id: string;
  name: string;
  href: string;
}

interface DocumentHeaderProps {
  /** Dokument do wyświetlenia */
  document: DocumentDto | null;
  /** Lista elementów breadcrumb */
  breadcrumbs: BreadcrumbItem[];
  /** Liczba niezatwierdzonych fiszek AI */
  unapprovedCount: number;
  /** Callback wywoływany po kliknięciu przycisku powrotu */
  onBack: () => void;
  /** Callback wywoływany po kliknięciu przycisku edycji */
  onEdit: () => void;
  /** Callback wywoływany po kliknięciu przycisku usuwania */
  onDelete: () => void;
  /** Callback wywoływany po kliknięciu przycisku regeneracji fiszek */
  onRegenerate: () => void;
  /** Czy trwa ładowanie danych */
  isLoading?: boolean;
}

export function DocumentHeader({
  document,
  breadcrumbs,
  unapprovedCount,
  onBack,
  onEdit,
  onDelete,
  onRegenerate,
  isLoading = false,
}: DocumentHeaderProps) {
  if (!document) {
    return null;
  }

  return (
    <header className="space-y-4 pb-4 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Powrót</span>
          </Button>

          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item) => (
                <BreadcrumbItem key={item.id}>
                  <BreadcrumbLink href={item.href}>{item.name}</BreadcrumbLink>
                  <BreadcrumbSeparator />
                </BreadcrumbItem>
              ))}
              <BreadcrumbItem>
                <BreadcrumbPage>{document.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <DocumentActions
          id={document.id}
          onEdit={onEdit}
          onDelete={onDelete}
          onRegenerate={onRegenerate}
          isLoading={isLoading}
          unapprovedCount={unapprovedCount}
        />
      </div>

      {document.content && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground line-clamp-2">{document.content}</p>
        </div>
      )}
    </header>
  );
}
