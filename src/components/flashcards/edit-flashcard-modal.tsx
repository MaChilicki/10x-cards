import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FlashcardForm } from "./flashcard-form";
import type { FlashcardDto, FlashcardUpdateDto } from "@/types";

interface EditFlashcardModalProps {
  isOpen: boolean;
  flashcard: FlashcardDto | null;
  onClose: () => void;
  onSubmit: (flashcardId: string, data: FlashcardUpdateDto) => Promise<void>;
  isSubmitting?: boolean;
}

export function EditFlashcardModal({
  isOpen,
  flashcard,
  onClose,
  onSubmit,
  isSubmitting = false,
}: EditFlashcardModalProps) {
  if (!flashcard) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edytuj fiszkę</DialogTitle>
        </DialogHeader>
        <FlashcardForm
          initialData={{
            front_original: flashcard.front_original,
            front_modified: flashcard.front_modified,
            back_original: flashcard.back_original,
            back_modified: flashcard.back_modified,
          }}
          onSubmit={async (data) => {
            await onSubmit(flashcard.id, {
              front_modified: data.front,
              back_modified: data.back,
            });
          }}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
