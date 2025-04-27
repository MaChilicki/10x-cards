import { useState } from "react";

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  onConfirm: () => Promise<void>;
  dangerousHTML?: boolean;
}

const defaultState: ConfirmDialogState = {
  isOpen: false,
  title: "",
  description: "",
  confirmText: "Potwierdź",
  onConfirm: () => Promise.resolve(),
  dangerousHTML: false,
};

interface OpenDialogOptions {
  title: string;
  description: string;
  confirmText?: string;
  onConfirm: () => Promise<void>;
  dangerousHTML?: boolean;
}

export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>(defaultState);

  const openDialog = ({
    title,
    description,
    confirmText = "Potwierdź",
    onConfirm,
    dangerousHTML = false,
  }: OpenDialogOptions) => {
    setDialogState({
      isOpen: true,
      title,
      description,
      confirmText,
      onConfirm,
      dangerousHTML,
    });
  };

  const closeDialog = () => {
    setDialogState(defaultState);
  };

  const handleConfirm = async () => {
    try {
      await dialogState.onConfirm();
    } finally {
      closeDialog();
    }
  };

  return {
    dialogState,
    actions: {
      openDialog,
      closeDialog,
      handleConfirm,
    },
  };
}
