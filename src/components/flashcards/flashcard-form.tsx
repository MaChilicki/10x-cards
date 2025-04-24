import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { FlashcardDto } from "@/types";

interface FlashcardFormData {
  front: string;
  back: string;
}

interface FlashcardFormErrors {
  front?: string;
  back?: string;
  general?: string;
}

const defaultFormData: FlashcardFormData = {
  front: "",
  back: "",
};

interface FlashcardFormProps {
  initialData?: Pick<FlashcardDto, "front_original" | "front_modified" | "back_original" | "back_modified">;
  onSubmit: (data: FlashcardFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function FlashcardForm({ initialData, onSubmit, onCancel, isSubmitting = false }: FlashcardFormProps) {
  const [formData, setFormData] = useState<FlashcardFormData>(() => ({
    front: initialData?.front_modified || initialData?.front_original || "",
    back: initialData?.back_modified || initialData?.back_original || "",
  }));
  const [errors, setErrors] = useState<FlashcardFormErrors>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        front: initialData.front_modified || initialData.front_original,
        back: initialData.back_modified || initialData.back_original,
      });
      setErrors({});
    }
    return undefined;
  }, [initialData]);

  const validate = () => {
    const newErrors: FlashcardFormErrors = {};

    if (!formData.front.trim()) {
      newErrors.front = "Przód fiszki jest wymagany";
    } else if (formData.front.length > 200) {
      newErrors.front = "Przód fiszki nie może być dłuższy niż 200 znaków";
    }

    if (!formData.back.trim()) {
      newErrors.back = "Tył fiszki jest wymagany";
    } else if (formData.back.length > 500) {
      newErrors.back = "Tył fiszki nie może być dłuższy niż 500 znaków";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FlashcardFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await onSubmit(formData);
      setFormData(defaultFormData);
      setErrors({});
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : "Wystąpił nieznany błąd",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="front" className="text-sm font-medium">
          Przód fiszki
        </label>
        <Textarea
          id="front"
          placeholder="Wpisz treść przodu fiszki..."
          className="min-h-[100px]"
          value={formData.front}
          onChange={(e) => handleChange("front", e.target.value)}
          disabled={isSubmitting}
          aria-label="Przód fiszki"
          aria-required="true"
          aria-invalid={!!errors.front}
        />
        {errors.front && <p className="text-sm text-destructive">{errors.front}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="back" className="text-sm font-medium">
          Tył fiszki
        </label>
        <Textarea
          id="back"
          placeholder="Wpisz treść tyłu fiszki..."
          className="min-h-[100px]"
          value={formData.back}
          onChange={(e) => handleChange("back", e.target.value)}
          disabled={isSubmitting}
          aria-label="Tył fiszki"
          aria-required="true"
          aria-invalid={!!errors.back}
        />
        {errors.back && <p className="text-sm text-destructive">{errors.back}</p>}
      </div>

      {errors.general && <p className="text-sm text-destructive">{errors.general}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Anuluj
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoadingSpinner className="mr-2 h-4 w-4" />
              Zapisywanie...
            </>
          ) : (
            "Zapisz"
          )}
        </Button>
      </div>
    </form>
  );
}
