import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonGroupProps {
  onSave: () => void;
  onCancel: () => void;
  onGenerateFlashcards: () => void;
  isSaving: boolean;
  isGenerating: boolean;
  disableGenerate: boolean;
}

export function SubmitButtonGroup({
  onSave,
  onCancel,
  onGenerateFlashcards,
  isSaving,
  isGenerating,
  disableGenerate
}: SubmitButtonGroupProps) {
  return (
    <div className="flex items-center justify-end space-x-4 mt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSaving || isGenerating}
      >
        Anuluj
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={onGenerateFlashcards}
        disabled={disableGenerate || isSaving || isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generowanie...
          </>
        ) : (
          "Generuj fiszki"
        )}
      </Button>
      <Button
        type="submit"
        onClick={onSave}
        disabled={isSaving || isGenerating}
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Zapisywanie...
          </>
        ) : (
          "Zapisz zmiany"
        )}
      </Button>
    </div>
  );
} 