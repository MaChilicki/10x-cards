import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DocumentDetailView } from "../document-detail-view";
import { toast } from "sonner";
import { logger } from "@/lib/services/logger.service";

// Mocks
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock dla loggera
vi.mock("@/lib/services/logger.service", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock dla useNavigate
const navigateMock = vi.fn();
vi.mock("@/components/hooks/use-navigate", () => ({
  useNavigate: () => navigateMock,
}));

// Mock dla useDocumentDetail
vi.mock("../hooks/use-document-detail", () => ({
  useDocumentDetail: () => ({
    document: { id: "doc123", title: "Test Document", topic_id: "topic123" },
    isLoadingDocument: false,
    documentError: null,
    actions: {
      deleteDocument: vi.fn(),
      editDocument: vi.fn(),
    },
    refetch: vi.fn(),
  }),
}));

// Mock dla useFlashcardsList
vi.mock("../../flashcards/hooks/use-flashcards-list", () => ({
  useFlashcardsList: () => ({
    flashcards: [{ id: "1", front_original: "Testowa fiszka", back_original: "Testowa odpowiedź" }],
    isLoading: false,
    error: null,
    pagination: { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 24 },
    setPage: vi.fn(),
    setItemsPerPage: vi.fn(),
    sort: { sortBy: "created_at", sortOrder: "desc" },
    updateSort: vi.fn(),
    refetch: vi.fn(),
  }),
}));

// Mock dla useConfirmDialog
vi.mock("../hooks/use-confirm-dialog", () => ({
  useConfirmDialog: () => ({
    dialogState: { isOpen: false },
    actions: {
      openDialog: vi.fn(),
      closeDialog: vi.fn(),
      handleConfirm: vi.fn(),
    },
  }),
}));

// Interfejs dla propów EditFlashcardModal
interface EditFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { front_original: string; back_original: string; source: string }) => void;
  mode?: "add" | "edit";
}

// Mock dla EditFlashcardModal
vi.mock("../../flashcards/flashcard-edit-modal", () => ({
  EditFlashcardModal: ({ isOpen, onClose, onSubmit }: EditFlashcardModalProps) => {
    if (!isOpen) return null;

    // Prosty mock dla modalu, który umożliwia testowanie onSubmit
    return (
      <div data-testid="mock-modal">
        <button
          onClick={() =>
            onSubmit({
              front_original: "Pytanie testowe",
              back_original: "Odpowiedź testowa",
              source: "manual",
            })
          }
          data-testid="submit-button"
        >
          Zapisz
        </button>
        <button onClick={onClose} data-testid="close-button">
          Anuluj
        </button>
      </div>
    );
  },
}));

describe("handleAddFlashcard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
    // Mock dla globalnego fetch
    global.fetch = vi.fn();
  });

  it("powinien dodać fiszkę gdy odpowiedź API jest poprawna", async () => {
    // Przygotowanie: Mockujemy poprawną odpowiedź API
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: "123" }),
    });

    // Działanie: Renderujemy komponent
    render(<DocumentDetailView documentId="doc123" />);

    // Znajdujemy przycisk "Dodaj fiszkę ręcznie"
    const addButton = await screen.findByText("Dodaj fiszkę ręcznie");

    // Klikamy przycisk, aby otworzyć modal
    fireEvent.click(addButton);

    // Sprawdzamy, czy modal został wyświetlony
    const modal = await screen.findByTestId("mock-modal");
    expect(modal).toBeInTheDocument();

    // Klikamy przycisk zapisu w modalu, aby wywołać onSubmit
    const submitButton = await screen.findByTestId("submit-button");
    fireEvent.click(submitButton);

    // Sprawdzenie: Weryfikujemy, że fetch został wywołany z odpowiednimi parametrami
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/flashcards",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: expect.stringContaining("Pytanie testowe"),
        })
      );
      // Sprawdzamy, czy wyświetlono komunikat sukcesu
      expect(toast.success).toHaveBeenCalledWith("Fiszka została dodana");
    });
  });

  it("powinien obsłużyć błąd API podczas dodawania fiszki", async () => {
    // Przygotowanie: Mockujemy błędną odpowiedź API
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    // Działanie: Renderujemy komponent
    render(<DocumentDetailView documentId="doc123" />);

    // Otwieramy modal i wykonujemy submit
    const addButton = await screen.findByText("Dodaj fiszkę ręcznie");
    fireEvent.click(addButton);

    // Przygotowujemy się na odrzucenie Promise w handleAddFlashcard
    const submitButton = await screen.findByTestId("submit-button");
    const clickPromise = Promise.resolve()
      .then(() => {
        fireEvent.click(submitButton);
        return Promise.resolve(); // Daje czas na obsługę błędu
      })
      .catch(() => {
        // Przechwytujemy potencjalny błąd, aby nie zatrzymał testu
      });

    // Czekamy na zakończenie asynchronicznych operacji
    await clickPromise;

    // Sprawdzenie: Weryfikujemy obsługę błędu
    await waitFor(() => {
      // Oczekujemy wyjątku w kodzie, który powinien zostać złapany
      expect(global.fetch).toHaveBeenCalled();
      // Sprawdzamy czy logger.error został wywołany
      expect(logger.error).toHaveBeenCalledWith("Błąd podczas dodawania fiszki:", expect.any(Error));
      // Modal nie powinien zostać zamknięty w przypadku błędu
      expect(screen.getByTestId("mock-modal")).toBeInTheDocument();
    });

    // UWAGA: Ten test może powodować pojawienie się komunikatu o nieobsłużonym odrzuconym Promise:
    // "Unhandled Rejection: Error: Nie udało się dodać fiszki"
    // Jest to spodziewane zachowanie, ponieważ w komponencie, po próbie dodania fiszki i otrzymaniu
    // błędu 500, rzucamy wyjątek, który nie jest w pełni obsługiwany w teście.
  });

  it("powinien przekierować na stronę logowania gdy sesja wygasła (status 401)", async () => {
    // Przygotowanie: Mockujemy odpowiedź 401 (Unauthorized)
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    // Działanie: Renderujemy komponent
    render(<DocumentDetailView documentId="doc123" />);

    // Otwieramy modal i wykonujemy submit
    const addButton = await screen.findByText("Dodaj fiszkę ręcznie");
    fireEvent.click(addButton);

    const submitButton = await screen.findByTestId("submit-button");
    fireEvent.click(submitButton);

    // Sprawdzenie: Weryfikujemy przekierowanie do strony logowania
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Sesja wygasła"));
      expect(navigateMock).toHaveBeenCalledWith("/login");
    });
  });
});
