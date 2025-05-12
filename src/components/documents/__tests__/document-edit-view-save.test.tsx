import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocumentEditView } from "../document-edit-view";
import { toast } from "sonner";

// Mockowanie modułów
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/components/hooks/use-navigate", () => {
  const navigate = vi.fn();
  return {
    useNavigate: () => navigate,
  };
});

vi.mock("../hooks/use-navigation-prompt", () => ({
  useNavigationPrompt: () => ({
    dialogState: { isOpen: false },
    handleNavigation: vi.fn(async (callback) => callback()),
  }),
}));

vi.mock("../hooks/use-confirm-dialog", () => ({
  useConfirmDialog: () => ({
    dialogState: { isOpen: false, title: "", description: "", confirmText: "" },
    actions: {
      openDialog: vi.fn(),
      closeDialog: vi.fn(),
      handleConfirm: vi.fn(),
      handleCancel: vi.fn(),
    },
  }),
}));

// Mock dla fetch
global.fetch = vi.fn();

describe("DocumentEditView - zapisywanie", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("powinien utworzyć nowy dokument poprawnie", async () => {
    // Przygotowanie
    const mockResponse = {
      id: "new-doc-id",
      name: "Nowy dokument",
      content: "Treść nowego dokumentu".repeat(100),
    };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

    // Działanie
    render(<DocumentEditView topicId="456" />);

    await waitFor(() => {
      expect(screen.getByLabelText("Tytuł")).toBeInTheDocument();
    });

    // Wypełnij pola
    await userEvent.type(screen.getByLabelText("Tytuł"), "Nowy dokument");
    await userEvent.type(screen.getByLabelText("Treść"), "Treść nowego dokumentu".repeat(100));

    // Kliknij przycisk zapisz
    fireEvent.click(screen.getByText("Zapisz"));

    // Sprawdzenie
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/documents",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: expect.any(String),
        })
      );

      expect(toast.success).toHaveBeenCalledWith("Dokument został utworzony");
    });
  });

  it("powinien zaktualizować istniejący dokument", async () => {
    // Przygotowanie
    const mockDocument = {
      id: "123",
      name: "Istniejący dokument",
      content: "Treść istniejącego dokumentu".repeat(100),
      topic_id: "456",
    };

    const mockUpdatedDocument = {
      ...mockDocument,
      name: "Zaktualizowany dokument",
    };

    // Pierwsze żądanie - pobranie dokumentu
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDocument),
      })
      .mockResolvedValueOnce({
        // Drugie żądanie - aktualizacja dokumentu
        ok: true,
        json: () => Promise.resolve(mockUpdatedDocument),
      })
      .mockResolvedValueOnce({
        // Trzecie żądanie - pobranie fiszek AI
        ok: true,
        json: () => Promise.resolve({ data: [], pagination: { page: 1, limit: 24, total: 0 } }),
      });

    // Działanie
    render(<DocumentEditView documentId="123" />);

    // Poczekaj na załadowanie formularza z danymi dokumentu
    await waitFor(() => {
      expect(screen.getByDisplayValue("Istniejący dokument")).toBeInTheDocument();
    });

    // Zmień tytuł dokumentu
    await userEvent.clear(screen.getByLabelText("Tytuł"));
    await userEvent.type(screen.getByLabelText("Tytuł"), "Zaktualizowany dokument");

    // Kliknij przycisk zapisz
    fireEvent.click(screen.getByText("Zapisz"));

    // Sprawdzenie
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/documents/123",
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: expect.any(String),
        })
      );

      expect(toast.success).toHaveBeenCalledWith("Dokument został zaktualizowany");
    });
  });

  it("powinien obsłużyć wygaśnięcie sesji podczas zapisywania", async () => {
    // Przygotowanie
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

    // Działanie
    render(<DocumentEditView />);

    await waitFor(() => {
      expect(screen.getByLabelText("Tytuł")).toBeInTheDocument();
    });

    // Wypełnij pola
    await userEvent.type(screen.getByLabelText("Tytuł"), "Testowy tytuł");
    await userEvent.type(screen.getByLabelText("Treść"), "A".repeat(1001));

    // Kliknij przycisk zapisz
    fireEvent.click(screen.getByText("Zapisz"));

    // Sprawdzenie
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Sesja wygasła. Zostaniesz przekierowany do strony logowania.");
    });
  });
});
