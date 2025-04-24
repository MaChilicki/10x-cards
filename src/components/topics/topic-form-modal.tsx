import type { TopicDto, TopicCreateDto } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTopicForm } from "./hooks/use-topic-form";
import { useMemo } from "react";

interface TopicFormModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  initialData: TopicDto | null;
  onClose: () => void;
  onSubmit: (data: TopicCreateDto) => Promise<void>;
}

export function TopicFormModal({ isOpen, isEditMode, initialData, onClose, onSubmit }: TopicFormModalProps) {
  const createDto = useMemo(() => {
    if (!initialData) return undefined;

    return {
      name: initialData.name,
      description: initialData.description || undefined,
      parent_id: initialData.parent_id,
    };
  }, [initialData]);

  const { formData, errors, submitting, handleChange, handleSubmit, reset } = useTopicForm({
    initialData: createDto,
    onSubmit,
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
    if (!errors.general) {
      reset();
      onClose();
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleFormSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edytuj temat" : "Nowy temat"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Zmień nazwę lub opis tematu" : "Wprowadź nazwę i opcjonalny opis dla nowego tematu"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Input
                id="name"
                placeholder="Nazwa tematu"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                disabled={submitting}
                aria-label="Nazwa tematu"
                aria-required="true"
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Textarea
                id="description"
                placeholder="Opis tematu (opcjonalnie)"
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                disabled={submitting}
                aria-label="Opis tematu"
                aria-invalid={!!errors.description}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>
          </div>

          {errors.general && <p className="text-sm text-destructive mb-4">{errors.general}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Anuluj
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Zapisywanie..." : isEditMode ? "Zapisz zmiany" : "Utwórz temat"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
