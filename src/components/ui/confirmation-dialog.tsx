import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingSpinner } from "./loading-spinner";
import { cn } from "@/lib/utils";

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export function ConfirmationDialog({
  isOpen,
  title,
  description,
  confirmText = "Zatwierdź",
  onConfirm,
  onClose,
  isSubmitting = false,
  className,
}: ConfirmationDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className={cn(className)}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            <div dangerouslySetInnerHTML={{ __html: description }} />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Nie</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <LoadingSpinner className="h-4 w-4" /> : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
