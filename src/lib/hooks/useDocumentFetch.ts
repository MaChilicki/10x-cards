import { useState, useCallback } from 'react';
import type { DocumentDto } from '@/types';

export const useDocumentFetch = (id?: string) => {
  const [document, setDocument] = useState<DocumentDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocument = useCallback(async () => {
    if (!id) {
      setDocument(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/documents/${id}`);
      
      if (!response.ok) {
        throw new Error('Nie udało się pobrać dokumentu');
      }

      const data = await response.json();
      setDocument(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd');
      setDocument(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return {
    document,
    isLoading,
    error,
    fetchDocument
  };
}; 