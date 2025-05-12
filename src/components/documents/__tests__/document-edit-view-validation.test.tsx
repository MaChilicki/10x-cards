import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocumentEditView } from "../document-edit-view";

// Mockowanie modułów
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/components/hooks/use-navigate", () => ({
  useNavigate: () => vi.fn(),
}));

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

describe("DocumentEditView - walidacja", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Domyślna implementacja dla fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  it("powinien wyświetlić błędy walidacji dla pustych pól", async () => {
    // Działanie
    render(<DocumentEditView />);

    // Poczekaj na załadowanie formularza
    await waitFor(() => {
      expect(screen.getByText("Zapisz")).toBeInTheDocument();
    });

    // Kliknij przycisk zapisz bez wypełniania pól
    fireEvent.click(screen.getByText("Zapisz"));

    // Sprawdzenie
    await waitFor(() => {
      expect(screen.getByText("Tytuł jest wymagany")).toBeInTheDocument();
      expect(screen.getByText("Treść jest wymagana")).toBeInTheDocument();
    });
  });

  it("powinien wyświetlić błąd dla zbyt krótkiej treści", async () => {
    // Działanie
    render(<DocumentEditView />);

    await waitFor(() => {
      expect(screen.getByLabelText("Tytuł")).toBeInTheDocument();
    });

    // Wypełnij pola
    await userEvent.type(screen.getByLabelText("Tytuł"), "Testowy tytuł");
    await userEvent.type(screen.getByLabelText("Treść"), "Zbyt krótka treść");

    // Kliknij przycisk zapisz
    fireEvent.click(screen.getByText("Zapisz"));

    // Sprawdzenie
    await waitFor(() => {
      expect(screen.getByText("Treść musi zawierać co najmniej 1000 znaków")).toBeInTheDocument();
    });
  });

  it("powinien wyświetlić błąd dla zbyt długiego tytułu", async () => {
    // Działanie
    render(<DocumentEditView />);

    await waitFor(() => {
      expect(screen.getByLabelText("Tytuł")).toBeInTheDocument();
    });

    // Wypełnij pola z zbyt długim tytułem
    const zbytDługiTytuł = "A".repeat(101);
    await userEvent.type(screen.getByLabelText("Tytuł"), zbytDługiTytuł);
    await userEvent.type(screen.getByLabelText("Treść"), "A".repeat(1001));

    // Kliknij przycisk zapisz
    fireEvent.click(screen.getByText("Zapisz"));

    // Sprawdzenie
    await waitFor(() => {
      expect(screen.getByText("Tytuł nie może przekraczać 100 znaków")).toBeInTheDocument();
    });
  });
});
