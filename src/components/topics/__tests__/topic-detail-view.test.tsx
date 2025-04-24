import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import TopicDetailView from "../topic-detail-view";
import { useTopicDetail } from "../hooks/use-topic-detail";
import { useDocumentsList } from "@/components/documents/hooks/use-documents-list";
import { useNavigate } from "@/hooks/use-navigate";

// Mock hooki
vi.mock("../hooks/use-topic-detail");
vi.mock("@/components/documents/hooks/use-documents-list");
vi.mock("@/hooks/use-navigate");

describe("TopicDetailView", () => {
  const mockNavigate = vi.fn();
  const mockTopic = {
    id: "1",
    name: "Test Topic",
    description: "Test Description",
    documents_count: 5,
    flashcards_count: 10,
    breadcrumbs: [],
  };

  const mockDocuments = [
    {
      id: "1",
      name: "Document 1",
      description: "Description 1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      flashcards_count: 5,
    },
  ];

  const mockPagination = {
    currentPage: 1,
    totalPages: 1,
    totalItems: 1,
    itemsPerPage: 12,
    availablePerPage: [12, 24, 36],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useTopicDetail as jest.Mock).mockReturnValue({
      topic: mockTopic,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    (useDocumentsList as jest.Mock).mockReturnValue({
      documents: mockDocuments,
      isLoading: false,
      error: null,
      pagination: mockPagination,
      refetch: vi.fn(),
      setPage: vi.fn(),
      setPerPage: vi.fn(),
    });
  });

  describe("Ścieżki użytkownika", () => {
    test("wyświetla szczegóły tematu i listę dokumentów", () => {
      render(<TopicDetailView topicId="1" />);

      expect(screen.getByText(mockTopic.name)).toBeInTheDocument();
      expect(screen.getByText(mockTopic.description)).toBeInTheDocument();
      expect(screen.getByText(mockDocuments[0].name)).toBeInTheDocument();
    });

    test("obsługuje zmianę liczby dokumentów na stronie", async () => {
      const { setPerPage } = useDocumentsList();
      render(<TopicDetailView topicId="1" />);

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "24" } });

      await waitFor(() => {
        expect(setPerPage).toHaveBeenCalledWith(24);
      });
    });

    test("obsługuje usuwanie dokumentu", async () => {
      global.fetch = vi.fn().mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      );

      render(<TopicDetailView topicId="1" />);

      const deleteButton = screen.getByLabelText(/usuń dokument/i);
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByText(/usuń/i);
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/documents/"),
          expect.objectContaining({ method: "DELETE" })
        );
      });
    });
  });

  describe("Obsługa błędów", () => {
    test("wyświetla błąd ładowania tematu", () => {
      (useTopicDetail as jest.Mock).mockReturnValue({
        topic: null,
        isLoading: false,
        error: new Error("Błąd ładowania tematu"),
        refetch: vi.fn(),
      });

      render(<TopicDetailView topicId="1" />);
      expect(screen.getByText(/błąd.*ładowania tematu/i)).toBeInTheDocument();
    });

    test("wyświetla błąd ładowania dokumentów", () => {
      (useDocumentsList as jest.Mock).mockReturnValue({
        documents: [],
        isLoading: false,
        error: new Error("Błąd ładowania dokumentów"),
        pagination: mockPagination,
        refetch: vi.fn(),
        setPage: vi.fn(),
        setPerPage: vi.fn(),
      });

      render(<TopicDetailView topicId="1" />);
      expect(screen.getByText(/błąd.*ładowania dokumentów/i)).toBeInTheDocument();
    });

    test("wyświetla błąd usuwania dokumentu", async () => {
      global.fetch = vi.fn().mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ error: { message: "Błąd usuwania" } }),
        })
      );

      render(<TopicDetailView topicId="1" />);

      const deleteButton = screen.getByLabelText(/usuń dokument/i);
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByText(/usuń/i);
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/błąd usuwania/i)).toBeInTheDocument();
      });
    });
  });

  describe("Responsywność", () => {
    test("wyświetla odpowiednią liczbę kolumn na różnych szerokościach ekranu", () => {
      const { container } = render(<TopicDetailView topicId="1" />);

      // Sprawdź klasy grid dla różnych breakpointów
      const grid = container.querySelector(".grid");
      expect(grid).toHaveClass("md:grid-cols-2", "lg:grid-cols-3");
    });
  });
});
