import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PUT, DELETE } from "../[id]";
import { DocumentsService } from "../../../../lib/services/documents.service";
import { logger } from "../../../../lib/services/logger.service";

// Mock dla DocumentsService
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

describe("Document API Endpoints", () => {
  let mockContext: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockContext = {
      params: { id: "123" },
      locals: {
        supabase: {},
      },
    };
  });

  describe("GET /api/documents/[id]", () => {
    it("zwraca dokument gdy istnieje", async () => {
      vi.mocked(DocumentsService.prototype.getDocumentById).mockResolvedValueOnce(mockDocument);

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockDocument);
    });

    it("zwraca 404 gdy dokument nie istnieje", async () => {
      vi.mocked(DocumentsService.prototype.getDocumentById).mockRejectedValueOnce(new Error("Dokument nie istnieje"));

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Nie znaleziono dokumentu");
    });

    it("zwraca 400 dla nieprawidłowego ID", async () => {
      mockContext.params.id = undefined;

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Nieprawidłowe ID dokumentu");
    });

    it("zwraca 500 dla błędu serwera", async () => {
      vi.mocked(DocumentsService.prototype.getDocumentById).mockRejectedValueOnce(new Error("Database error"));

      const response = await GET(mockContext);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Wystąpił błąd podczas pobierania dokumentu");
    });
  });

  describe("PUT /api/documents/[id]", () => {
    const mockUpdateData = {
      name: "Updated Document",
      content: "Updated Content",
    };

    const mockRequest = {
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      json: async () => mockUpdateData,
    } as Request;

    it("aktualizuje dokument pomyślnie", async () => {
      const updatedDocument = {
        ...mockDocument,
        ...mockUpdateData,
      };

      vi.mocked(DocumentsService.prototype.updateDocument).mockResolvedValueOnce(updatedDocument);

      const response = await PUT({ ...mockContext, request: mockRequest });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe(mockUpdateData.name);
      expect(data.content).toBe(mockUpdateData.content);
    });

    it("zwraca 400 dla nieprawidłowych danych", async () => {
      const invalidRequest = {
        headers: new Headers({
          "Content-Type": "application/json",
        }),
        json: async () => ({ name: "" }), // Nieprawidłowe dane
      } as Request;

      const response = await PUT({ ...mockContext, request: invalidRequest });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Nieprawidłowe dane wejściowe");
    });

    it("zwraca 415 dla nieprawidłowego Content-Type", async () => {
      const invalidRequest = {
        headers: new Headers(),
        json: async () => ({}),
      } as Request;

      const response = await PUT({ ...mockContext, request: invalidRequest });
      const data = await response.json();

      expect(response.status).toBe(415);
      expect(data.error).toBe("Nieprawidłowy format danych");
    });
  });

  describe("DELETE /api/documents/[id]", () => {
    it("usuwa dokument pomyślnie", async () => {
      vi.mocked(DocumentsService.prototype.deleteDocument).mockResolvedValueOnce();

      const response = await DELETE(mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Dokument został pomyślnie usunięty");
    });

    it("zwraca 400 dla nieprawidłowego ID", async () => {
      mockContext.params.id = undefined;

      const response = await DELETE(mockContext);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Nieprawidłowe ID dokumentu");
    });

    it("zwraca 500 dla błędu serwera", async () => {
      vi.mocked(DocumentsService.prototype.deleteDocument).mockRejectedValueOnce(new Error("Database error"));

      const response = await DELETE(mockContext);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Wystąpił błąd podczas usuwania dokumentu");
    });
  });
});
