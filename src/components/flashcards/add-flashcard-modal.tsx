import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FlashcardForm } from "./flashcard-form";
import type { FlashcardCreateDto } from "@/types";

interface AddFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Pick<FlashcardCreateDto, "front_original" | "back_original">) => Promise<void>;
  isSubmitting?: boolean;
}

export function AddFlashcardModal({ isOpen, onClose, onSubmit, isSubmitting = false }: AddFlashcardModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Dodaj nową fiszkę</DialogTitle>
        </DialogHeader>
        <FlashcardForm
          onSubmit={async (data) => {
            await onSubmit({
              front_original: data.front,
              back_original: data.back,
            });
          }}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
