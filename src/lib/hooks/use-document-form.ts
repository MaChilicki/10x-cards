import { useState, useCallback } from "react";
import type { FormValues } from "../types/document-edit.types";

export const useDocumentForm = (initialValues: FormValues, onSubmit: (values: FormValues) => Promise<void>) => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback((formValues: FormValues): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!formValues.name) {
      newErrors.name = "Tytuł jest wymagany";
    } else if (formValues.name.length > 100) {
      newErrors.name = "Tytuł nie może przekraczać 100 znaków";
    }

    if (!formValues.content) {
      newErrors.content = "Treść jest wymagana";
    } else if (formValues.content.length < 1000) {
      newErrors.content = "Treść musi zawierać co najmniej 1000 znaków";
    } else if (formValues.content.length > 10000) {
      newErrors.content = "Treść nie może przekraczać 10000 znaków";
    }

    if (!formValues.topic_id) {
      newErrors.topic_id = "Temat jest wymagany";
    }

    return newErrors;
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    const newErrors = validate(values);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
        setIsDirty(false);
      } catch (error) {
        // Błędy API są obsługiwane przez komponent nadrzędny
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsDirty(false);
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    isDirty,
    isSubmitting,
    handleChange,
    handleSubmit,
    validate,
    reset,
  };
};
