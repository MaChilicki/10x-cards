import { useState, useCallback } from "react";
import type { FlashcardAiResponse } from "@/types";

export const useGenerateFlashcards = (documentId?: string) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFlashcards = useCallback(
    async (content: string) => {
      if (!documentId) {
        setError("Brak ID dokumentu");
        return null;
      }

      setIsGenerating(true);
      setError(null);

      try {
        const response = await fetch("/api/flashcards/ai-generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: content,
            document_id: documentId,
          }),
        });

        if (!response.ok) {
          throw new Error("Nie udało się wygenerować fiszek");
        }

        const data: FlashcardAiResponse = await response.json();
        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd";
        setError(errorMessage);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [documentId]
  );

  return {
    isGenerating,
    error,
    generateFlashcards,
  };
};
