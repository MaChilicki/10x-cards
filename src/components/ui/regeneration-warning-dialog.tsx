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

interface RegenerationWarningDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RegenerationWarningDialog({ 
  isOpen, 
  onConfirm, 
  onCancel 
}: RegenerationWarningDialogProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ponowne generowanie fiszek</AlertDialogTitle>
          <AlertDialogDescription>
            Ten dokument ma już wygenerowane fiszki. Ponowne generowanie spowoduje
            usunięcie istniejących fiszek i utworzenie nowych na podstawie aktualnej
            treści dokumentu. Czy na pewno chcesz kontynuować?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Anuluj
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Generuj nowe fiszki
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 