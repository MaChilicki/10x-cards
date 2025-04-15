import type { DocumentCreateDto, DocumentDto } from "@/types";

// Wartości formularza
export type FormValues = DocumentCreateDto;

// Propsy dla formularza
export interface DocumentFormProps {
  initialValues: FormValues;
  onSubmit: (values: FormValues) => Promise<void>;
  onCancel: () => void;
  onGenerateFlashcards: () => Promise<void>;
  isSaving: boolean;
  isGenerating: boolean;
  errors: Record<string, string>;
}

// Kontekst formularza
export interface FormContextType {
  values: FormValues;
  errors: Record<string, string>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: (values: FormValues) => Promise<void>;
  isDirty: boolean;
}

// ViewModel dla dokumentu
export interface DocumentViewModel extends DocumentDto {
  isNew: boolean;
  isSaving: boolean;
  isGenerating: boolean;
  errors: Record<string, string>;
} 