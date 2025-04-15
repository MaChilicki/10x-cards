import { useEffect, useState, lazy, Suspense, useCallback } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DocumentEditForm } from '@/components/document-edit-form';
import { useDocumentForm } from '@/lib/hooks/use-document-form';
import { useDocumentFetch } from '@/lib/hooks/use-document-fetch';
import { useGenerateFlashcards } from '@/lib/hooks/use-generate-flashcards';
import type { DocumentCreateDto, DocumentUpdateDto, DocumentDto } from '@/types';

const NavigationPrompt = lazy(() => import('@/components/ui/navigation-prompt'));
const RegenerationWarningDialog = lazy(() => import('@/components/ui/regeneration-warning-dialog'));

export function DocumentEditView() {
  // Pobieramy ID z parametrów URL
  const params = new URLSearchParams(window.location.search);
  const documentId = params.get('id') || undefined;
  const topicId = params.get('topic_id') || undefined;

  const [showNavigationPrompt, setShowNavigationPrompt] = useState(false);
  const [showRegenerationWarning, setShowRegenerationWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  const { document, isLoading: isLoadingDocument, error: fetchError, fetchDocument } = useDocumentFetch(documentId);
  const { isGenerating, error: generateError, generateFlashcards } = useGenerateFlashcards(documentId);

  const initialValues: DocumentCreateDto = {
    name: document?.name ?? '',
    content: document?.content ?? '',
    topic_id: document?.topic_id ?? topicId
  };

  const {
    values,
    errors,
    isDirty,
    isSubmitting,
    handleChange,
    handleSubmit: formHandleSubmit,
    reset
  } = useDocumentForm(initialValues, async (values: DocumentCreateDto) => {
    try {
      if (documentId) {
        // Aktualizacja istniejącego dokumentu
        const updateData: DocumentUpdateDto = {
          name: values.name,
          content: values.content
        };

        const response = await fetch(`/api/documents/${documentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          throw new Error('Nie udało się zaktualizować dokumentu');
        }
      } else {
        // Tworzenie nowego dokumentu
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          throw new Error('Nie udało się utworzyć dokumentu');
        }

        const data = await response.json();
        // Przekierowanie do edycji nowo utworzonego dokumentu
        window.location.href = `/documents/${data.id}/edit`;
      }
    } catch (error) {
      console.error('Błąd podczas zapisywania dokumentu:', error);
      throw error;
    }
  });

  useEffect(() => {
    if (documentId) {
      fetchDocument();
    }
  }, [documentId, fetchDocument]);

  const handleCancel = useCallback(() => {
    if (isDirty) {
      setShowNavigationPrompt(true);
      setPendingNavigation(() => () => {
        window.location.href = topicId 
          ? `/topics/${topicId}/documents` 
          : '/documents';
      });
    } else {
      window.location.href = topicId 
        ? `/topics/${topicId}/documents` 
        : '/documents';
    }
  }, [isDirty, topicId]);

  const handleConfirmNavigation = useCallback(() => {
    setShowNavigationPrompt(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  }, [pendingNavigation]);

  const handleCancelNavigation = useCallback(() => {
    setShowNavigationPrompt(false);
    setPendingNavigation(null);
  }, []);

  const handleGenerateFlashcards = useCallback(async () => {
    if (document?.has_flashcards) {
      setShowRegenerationWarning(true);
    } else {
      await generateFlashcards(values.content);
    }
  }, [document?.has_flashcards, generateFlashcards, values.content]);

  const handleConfirmRegeneration = useCallback(async () => {
    setShowRegenerationWarning(false);
    await generateFlashcards(values.content);
  }, [generateFlashcards, values.content]);

  const handleCloseRegenerationWarning = useCallback(() => {
    setShowRegenerationWarning(false);
  }, []);

  if (isLoadingDocument) {
    return <div>Ładowanie...</div>;
  }

  if (fetchError) {
    return <div>Błąd: {fetchError}</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/documents">Dokumenty</BreadcrumbLink>
          </BreadcrumbItem>
          {topicId && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/topics/${topicId}/documents`}>
                  {/* TODO: Dodać nazwę tematu */}
                  Temat
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{documentId ? 'Edycja dokumentu' : 'Nowy dokument'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold mb-8">
        {documentId ? 'Edycja dokumentu' : 'Nowy dokument'}
      </h1>

      <DocumentEditForm
        initialValues={values}
        onSubmit={formHandleSubmit}
        onCancel={handleCancel}
        onGenerateFlashcards={handleGenerateFlashcards}
        isSaving={isSubmitting}
        isGenerating={isGenerating}
        errors={errors}
      />

      <Suspense>
        {showNavigationPrompt && (
          <NavigationPrompt
            isOpen={showNavigationPrompt}
            onConfirm={handleConfirmNavigation}
            onCancel={handleCancelNavigation}
          />
        )}

        {showRegenerationWarning && (
          <RegenerationWarningDialog
            isOpen={showRegenerationWarning}
            onConfirm={handleConfirmRegeneration}
            onCancel={handleCloseRegenerationWarning}
          />
        )}
      </Suspense>
    </div>
  );
} 