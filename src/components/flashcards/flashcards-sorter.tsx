import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FlashcardsSortModel, FlashcardSource } from "@/types";

interface FlashcardsSorterProps {
  currentSort: FlashcardsSortModel;
  onChange: (sort: FlashcardsSortModel) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  sourceFilter?: FlashcardSource | "all";
  onSourceFilterChange?: (source: FlashcardSource | "all") => void;
}

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 36];

export function FlashcardsSorter({
  currentSort,
  onChange,
  itemsPerPage,
  onItemsPerPageChange,
  sourceFilter = "all",
  onSourceFilterChange,
}: FlashcardsSorterProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Select
        value={currentSort.sortBy}
        onValueChange={(value) => onChange({ ...currentSort, sortBy: value as FlashcardsSortModel["sortBy"] })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sortuj według" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="front">Treść (przód)</SelectItem>
          <SelectItem value="created_at">Data utworzenia</SelectItem>
          <SelectItem value="updated_at">Data modyfikacji</SelectItem>
          <SelectItem value="source">Źródło</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={currentSort.sortOrder}
        onValueChange={(value) => onChange({ ...currentSort, sortOrder: value as "asc" | "desc" })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Kolejność" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">Rosnąco</SelectItem>
          <SelectItem value="desc">Malejąco</SelectItem>
        </SelectContent>
      </Select>

      {onSourceFilterChange && (
        <Select value={sourceFilter} onValueChange={(value) => onSourceFilterChange(value as FlashcardSource | "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Źródło" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            <SelectItem value="ai">AI</SelectItem>
            <SelectItem value="manual">Manualne</SelectItem>
          </SelectContent>
        </Select>
      )}

      <div className="ml-auto flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Pokaż na stronie:</span>
        <Select value={itemsPerPage.toString()} onValueChange={(value) => onItemsPerPageChange(Number(value))}>
          <SelectTrigger className="w-[80px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ITEMS_PER_PAGE_OPTIONS.map((value) => (
              <SelectItem key={value} value={value.toString()}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
