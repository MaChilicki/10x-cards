import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "../index";
import { DocumentsService } from "../../../../lib/services/documents.service";
import { logger } from "../../../../lib/services/logger.service";

vi.mock("../../../../lib/services/documents.service");
vi.mock("../../../../lib/services/logger.service");

const mockDocument = {
  id: "123",
  name: "Test Document",
  content: "Test Content",
  user_id: "test-user",
  topic_id: "test-topic",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("Documents List API Endpoints", () => {
  let mockContext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockContext = {
      locals: {
        supabase: {},
      },
    };
  });

  describe("GET /api/documents", () => {
    it("zwraca listę dokumentów", async () => {
      const mockDocuments = {
        documents: [mockDocument],
        total: 1,
      };

      vi.mocked(DocumentsService.prototype.listDocuments).mockResolvedValueOnce(mockDocuments);

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockDocuments);
    });

    it("zwraca pustą listę gdy nie ma dokumentów", async () => {
      const mockEmptyList = {
        documents: [],
        total: 0,
      };

      vi.mocked(DocumentsService.prototype.listDocuments).mockResolvedValueOnce(mockEmptyList);

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockEmptyList);
    });

    it("zwraca 500 dla błędu serwera", async () => {
      vi.mocked(DocumentsService.prototype.listDocuments).mockRejectedValueOnce(new Error("Database error"));

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Wystąpił błąd podczas pobierania listy dokumentów");
    });
  });

  describe("POST /api/documents", () => {
    const mockCreateData = {
      name: "New Document",
      content: "New Content",
      topic_id: "test-topic",
    };

    const mockRequest = {
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      json: async () => mockCreateData,
    } as Request;

    it("tworzy nowy dokument pomyślnie", async () => {
      vi.mocked(DocumentsService.prototype.createDocument).mockResolvedValueOnce({
        ...mockDocument,
        ...mockCreateData,
      });

      const response = await POST({ ...mockContext, request: mockRequest });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe(mockCreateData.name);
      expect(data.content).toBe(mockCreateData.content);
    });

    it("zwraca 400 dla nieprawidłowych danych", async () => {
      const invalidRequest = {
        headers: new Headers({
          "Content-Type": "application/json",
        }),
        json: async () => ({ name: "" }), // Nieprawidłowe dane
      } as Request;

      const response = await POST({ ...mockContext, request: invalidRequest });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Nieprawidłowe dane wejściowe");
    });

    it("zwraca 415 dla nieprawidłowego Content-Type", async () => {
      const invalidRequest = {
        headers: new Headers(),
        json: async () => ({}),
      } as Request;

      const response = await POST({ ...mockContext, request: invalidRequest });
      const data = await response.json();

      expect(response.status).toBe(415);
      expect(data.error).toBe("Nieprawidłowy format danych");
    });

    it("zwraca 500 dla błędu serwera", async () => {
      vi.mocked(DocumentsService.prototype.createDocument).mockRejectedValueOnce(new Error("Database error"));

      const response = await POST({ ...mockContext, request: mockRequest });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Wystąpił błąd podczas tworzenia dokumentu");
    });
  });
});
