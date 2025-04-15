import { useEffect, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DocumentEditForm } from '@/components/document-edit-form';
import { NavigationPrompt } from '@/components/ui/navigation-prompt';
import { RegenerationWarningDialog } from '@/components/ui/regeneration-warning-dialog';
import { useDocumentForm } from '@/lib/hooks/useDocumentForm';
import { useDocumentFetch } from '@/lib/hooks/useDocumentFetch';
import { useGenerateFlashcards } from '@/lib/hooks/useGenerateFlashcards';
import type { DocumentCreateDto, DocumentUpdateDto, DocumentDto } from '@/types';

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
      await generateFlashcards(values.content);
    }
  };

  const handleConfirmRegeneration = async () => {
    setShowRegenerationWarning(false);
    await generateFlashcards(values.content);
  };

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

      <NavigationPrompt
        isOpen={showNavigationPrompt}
        onConfirm={handleConfirmNavigation}
        onCancel={handleCancelNavigation}
      />

      <RegenerationWarningDialog
        isOpen={showRegenerationWarning}
        onConfirm={handleConfirmRegeneration}
        onCancel={() => setShowRegenerationWarning(false)}
      />
    </div>
  );
} 