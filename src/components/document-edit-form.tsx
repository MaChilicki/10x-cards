import { useState } from "react";
import { TitleInput } from "@/components/ui/title-input";
import { ContentTextarea } from "@/components/ui/content-textarea";
import { SubmitButtonGroup } from "@/components/ui/submit-button-group";
import type { DocumentFormProps, FormValues } from "@/lib/types/document-edit.types";

export function DocumentEditForm({
  initialValues,
  onSubmit,
  onCancel,
  onGenerateFlashcards,
  isSaving,
  isGenerating,
  errors,
}: DocumentFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues);

  const canGenerateFlashcards = values.content.length >= 1000 && values.content.length <= 10000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <TitleInput value={values.name} onChange={handleChange} error={errors.name} disabled={isSaving || isGenerating} />

      <ContentTextarea
        value={values.content}
        onChange={handleChange}
        error={errors.content}
        disabled={isSaving || isGenerating}
      />

      <SubmitButtonGroup
        onSave={() => onSubmit(values)}
        onCancel={onCancel}
        onGenerateFlashcards={onGenerateFlashcards}
        isSaving={isSaving}
        isGenerating={isGenerating}
        disableGenerate={!canGenerateFlashcards}
      />
    </form>
  );
}
