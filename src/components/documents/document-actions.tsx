import { Edit, Trash2, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DocumentActionsProps {
  id: string;
  onEdit: () => void;
  onDelete: () => void;
  onRegenerate: () => void;
  isLoading?: boolean;
  unapprovedCount?: number;
}

export function DocumentActions({
  id,
  onEdit,
  onDelete,
  onRegenerate,
  isLoading = false,
  unapprovedCount = 0,
}: DocumentActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm" onClick={onEdit} disabled={isLoading}>
            <Edit className="h-4 w-4 mr-2" />
            Edytuj
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edytuj dokument</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm" onClick={onRegenerate} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Generuj fiszki
          </Button>
        </TooltipTrigger>
        <TooltipContent>Wygeneruj nowe fiszki AI</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm" onClick={onDelete} disabled={isLoading}>
            <Trash2 className="h-4 w-4 mr-2" />
            Usuń
          </Button>
        </TooltipTrigger>
        <TooltipContent>Usuń dokument</TooltipContent>
      </Tooltip>

      {unapprovedCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" asChild className="gap-2">
              <a href={`/documents/${id}/flashcards/approve`}>
                <Check className="h-4 w-4" />
                Zatwierdź fiszki ({unapprovedCount})
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Przejdź do zatwierdzania wygenerowanych fiszek</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
