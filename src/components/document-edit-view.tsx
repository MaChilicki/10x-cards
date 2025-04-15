import { useEffect, useState, lazy, Suspense } from 'react';
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
import { useTopicFetch } from '@/lib/hooks/use-topic-fetch';
import { useRouteParams } from '@/lib/hooks/use-route-params';
import { ErrorBoundary } from '@/components/error-boundary';
import { DocumentViewSkeleton } from '@/components/ui/loading-states';
import type { DocumentCreateDto, DocumentUpdateDto } from '@/types';

const NavigationPrompt = lazy(() => import('@/components/ui/navigation-prompt'));
const RegenerationWarningDialog = lazy(() => import('@/components/ui/regeneration-warning-dialog'));

export function DocumentEditView() {
  const { documentId, topicId } = useRouteParams();
  const [showNavigationPrompt, setShowNavigationPrompt] = useState(false);
  const [showRegenerationWarning, setShowRegenerationWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  const { document, isLoading: isLoadingDocument, error: fetchError, fetchDocument } = useDocumentFetch(documentId);
  const { topic, isLoading: isLoadingTopic, error: topicError, fetchTopic } = useTopicFetch(topicId);
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

  useEffect(() => {
    if (topicId) {
      fetchTopic();
    }
  }, [topicId, fetchTopic]);

  const handleCancel = () => {
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
  };

  const handleConfirmNavigation = () => {
    setShowNavigationPrompt(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  };

  const handleCancelNavigation = () => {
    setShowNavigationPrompt(false);
    setPendingNavigation(null);
  };

  const handleGenerateFlashcards = async () => {
    if (document?.has_flashcards) {
      setShowRegenerationWarning(true);
    } else {
      try {
        const result = await generateFlashcards(values.content);
        if (result) {
          window.location.href = `/documents/${documentId}/flashcards/approve`;
        }
      } catch (error) {
        throw error;
      }
    }
  };

  const handleConfirmRegeneration = async () => {
    setShowRegenerationWarning(false);
    try {
      const result = await generateFlashcards(values.content);
      if (result) {
        window.location.href = `/documents/${documentId}/flashcards/approve`;
      }
    } catch (error) {
      throw error;
    }
  };

  if (isLoadingDocument || isLoadingTopic) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <DocumentViewSkeleton />
      </div>
    );
  }

  if (fetchError || topicError) {
    throw new Error(fetchError || topicError || 'Wystąpił nieoczekiwany błąd');
  }

  return (
    <ErrorBoundary>
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
                    {topic?.name || 'Temat'}
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

        <Suspense fallback={<DocumentViewSkeleton />}>
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
              onCancel={() => setShowRegenerationWarning(false)}
            />
          )}
        </Suspense>
      </div>
    </ErrorBoundary>
  );
} 