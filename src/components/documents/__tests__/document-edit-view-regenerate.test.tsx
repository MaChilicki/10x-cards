import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DocumentEditView } from "../document-edit-view";
import { toast } from "sonner";

// Mockowanie modułów
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const navigateMock = vi.fn();
vi.mock("@/components/hooks/use-navigate", () => ({
  useNavigate: () => navigateMock,
}));

vi.mock("../hooks/use-navigation-prompt", () => ({
  useNavigationPrompt: () => ({
    dialogState: { isOpen: false },
    handleNavigation: vi.fn(async (callback) => callback()),
  }),
}));

// Mockowanie dialogu potwierdzenia
const mockOpenDialog = vi.fn();
const mockCloseDialog = vi.fn();
const mockHandleConfirm = vi.fn();
const mockHandleCancel = vi.fn();

vi.mock("../hooks/use-confirm-dialog", () => ({
  useConfirmDialog: () => ({
    dialogState: { isOpen: false, title: "", description: "", confirmText: "" },
    actions: {
      openDialog: mockOpenDialog,
      closeDialog: mockCloseDialog,
      handleConfirm: mockHandleConfirm,
      handleCancel: mockHandleCancel,
    },
  }),
}));

// Mock dla fetch
global.fetch = vi.fn();

describe("DocumentEditView - regeneracja fiszek", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  it("powinien pokazać przycisk regeneracji fiszek dla istniejącego dokumentu", async () => {
    // Przygotowanie
    const mockDocument = {
      id: "123",
      name: "Testowy dokument",
      content: "Treść testowego dokumentu".repeat(100),
      topic_id: "456",
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockDocument),
    });

    // Działanie
    render(<DocumentEditView documentId="123" />);

    // Sprawdzenie
    await waitFor(() => {
      expect(screen.getByText("Regeneruj fiszki")).toBeInTheDocument();
    });
  });

  it("powinien wywołać API regeneracji fiszek po kliknięciu przycisku", async () => {
    // Przygotowanie
    const mockDocument = {
      id: "123",
      name: "Testowy dokument",
      content: "Treść testowego dokumentu".repeat(100),
      topic_id: "456",
    };

    const mockRegenerateResponse = {
      deleted_count: 5,
      flashcards: [{ id: "f1" }, { id: "f2" }],
    };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDocument),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRegenerateResponse),
      });

    // Działanie
    render(<DocumentEditView documentId="123" />);

    // Poczekaj na załadowanie przycisku
    await waitFor(() => {
      expect(screen.getByText("Regeneruj fiszki")).toBeInTheDocument();
    });

    // Kliknij przycisk regeneracji
    fireEvent.click(screen.getByText("Regeneruj fiszki"));

    // Sprawdzenie
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/flashcards/ai-regenerate",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ document_id: "123" }),
        })
      );

      expect(toast.success).toHaveBeenCalledWith("Fiszki zostały wygenerowane");
      expect(navigateMock).toHaveBeenCalledWith("/documents/123/flashcards/approve");
    });
  });

  it("powinien obsłużyć błąd podczas regeneracji fiszek", async () => {
    // Przygotowanie
    const mockDocument = {
      id: "123",
      name: "Testowy dokument",
      content: "Treść testowego dokumentu".repeat(100),
      topic_id: "456",
    };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDocument),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

    // Działanie
    render(<DocumentEditView documentId="123" />);

    // Poczekaj na załadowanie przycisku
    await waitFor(() => {
      expect(screen.getByText("Regeneruj fiszki")).toBeInTheDocument();
    });

    // Kliknij przycisk regeneracji
    fireEvent.click(screen.getByText("Regeneruj fiszki"));

    // Sprawdzenie
    await waitFor(() => {
      expect(screen.getByText("Nie udało się zregenerować fiszek")).toBeInTheDocument();
    });
  });

  it("powinien wyświetlić dialog przed regeneracją fiszek po zapisie dokumentu", async () => {
    // Przygotowanie
    const mockDocument = {
      id: "123",
      name: "Testowy dokument",
      content: "Treść testowego dokumentu".repeat(100),
      topic_id: "456",
    };

    const mockUpdatedDocument = {
      ...mockDocument,
      content: "Zmieniona treść dokumentu".repeat(100),
    };

    const mockFlashcards = {
      data: [{ id: "f1", front_original: "Fiszka 1", is_approved: true }],
      pagination: { page: 1, limit: 10, total: 1 },
    };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDocument),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUpdatedDocument),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFlashcards),
      });

    // Działanie
    render(<DocumentEditView documentId="123" />);

    // Poczekaj na załadowanie formularza
    await waitFor(() => {
      expect(screen.getByDisplayValue("Testowy dokument")).toBeInTheDocument();
    });

    // Zmień treść dokumentu
    await waitFor(() => {
      const textArea = screen.getByLabelText("Treść");
      fireEvent.change(textArea, { target: { value: "Zmieniona treść dokumentu".repeat(100) } });
    });

    // Kliknij przycisk zapisz
    fireEvent.click(screen.getByText("Zapisz"));

    // Sprawdzenie
    await waitFor(() => {
      expect(mockOpenDialog).toHaveBeenCalled();
      // Sprawdź czy dialog zawiera informacje o fiszkach
      const dialogCall = mockOpenDialog.mock.calls[0][0];
      expect(dialogCall.title).toBe("Wygeneruj nowe fiszki AI");
      expect(dialogCall.confirmText).toBe("Generuj");
    });
  });
});
