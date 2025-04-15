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

interface NavigationPromptProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function NavigationPrompt({ isOpen, onConfirm, onCancel }: NavigationPromptProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Niezapisane zmiany</AlertDialogTitle>
          <AlertDialogDescription>
            Masz niezapisane zmiany. Jeśli opuścisz tę stronę, zmiany zostaną utracone.
            Czy na pewno chcesz kontynuować?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Zostań na stronie
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Opuść stronę
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 