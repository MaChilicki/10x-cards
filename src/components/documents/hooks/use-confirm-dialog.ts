import { useState } from "react";

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  onConfirm: () => Promise<void>;
}

const defaultState: ConfirmDialogState = {
  isOpen: false,
  title: "",
  description: "",
  confirmText: "Potwierdź",
  onConfirm: () => Promise.resolve(),
};

interface OpenDialogOptions {
  title: string;
  description: string;
  confirmText?: string;
  onConfirm: () => Promise<void>;
}

export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>(defaultState);

  const openDialog = ({ title, description, confirmText = "Potwierdź", onConfirm }: OpenDialogOptions) => {
    setDialogState({
      isOpen: true,
      title,
      description,
      confirmText,
      onConfirm,
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
