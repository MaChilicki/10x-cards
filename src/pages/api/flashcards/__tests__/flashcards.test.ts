import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "../index";
import { PATCH as PATCH_BULK } from "../approve-bulk";
import { PATCH as PATCH_BY_DOCUMENT } from "../approve-by-document";
import { FlashcardsService } from "../../../../lib/services/flashcards.service";
import { logger } from "../../../../lib/services/logger.service";
import type { FlashcardDto } from "../../../../types";

// Mock dla FlashcardsService
vi.mock("../../../../lib/services/flashcards.service");

// Mock dla logger
vi.mock("../../../../lib/services/logger.service", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("Flashcards API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/flashcards", () => {
    it("powinno zwrócić listę fiszek", async () => {
      const mockFlashcards: FlashcardDto[] = [
        {
          id: "1",
          front_original: "Test 1",
          back_original: "Back 1",
          topic_id: "topic1",
          document_id: "doc1",
          source: "manual",
          is_approved: true,
          is_disabled: false,
          created_at: new Date().toISOString(),
          modification_percentage: 0,
        },
        {
          id: "2",
          front_original: "Test 2",
          back_original: "Back 2",
          topic_id: "topic1",
          document_id: "doc1",
          source: "manual",
          is_approved: true,
          is_disabled: false,
          created_at: new Date().toISOString(),
          modification_percentage: 0,
        },
      ];

      vi.mocked(FlashcardsService.prototype.getFlashcards).mockResolvedValueOnce({
        data: mockFlashcards,
        pagination: { page: 1, limit: 10, total: 2 },
      });

      const request = new Request("http://localhost/api/flashcards?page=1&limit=10");
      const response = await GET({ request } as any);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data).toHaveLength(2);
      expect(body.pagination).toBeDefined();
    });

    it("powinno obsłużyć błąd walidacji", async () => {
      const request = new Request("http://localhost/api/flashcards?page=invalid");
      const response = await GET({ request } as any);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Nieprawidłowe parametry zapytania");
    });
  });

  describe("PATCH /api/flashcards/approve-bulk", () => {
    it("powinno zatwierdzić wiele fiszek", async () => {
      const mockFlashcards: FlashcardDto[] = [
        {
          id: "1",
          front_original: "Test 1",
          back_original: "Back 1",
          topic_id: "topic1",
          document_id: "doc1",
          source: "ai",
          is_approved: true,
          is_disabled: false,
          created_at: new Date().toISOString(),
          modification_percentage: 0,
        },
        {
          id: "2",
          front_original: "Test 2",
          back_original: "Back 2",
          topic_id: "topic1",
          document_id: "doc1",
          source: "ai",
          is_approved: true,
          is_disabled: false,
          created_at: new Date().toISOString(),
          modification_percentage: 0,
        },
      ];

      const mockResult = {
        approved_count: 2,
        flashcards: mockFlashcards,
      };

      vi.mocked(FlashcardsService.prototype.approveBulk).mockResolvedValueOnce(mockResult);

      const request = new Request("http://localhost/api/flashcards/approve-bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flashcard_ids: ["1", "2"] }),
      });

      const response = await PATCH_BULK({ request } as any);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.approved_count).toBe(2);
      expect(body.data.flashcards).toHaveLength(2);
    });

    it("powinno obsłużyć błąd walidacji", async () => {
      const request = new Request("http://localhost/api/flashcards/approve-bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flashcard_ids: [] }),
      });

      const response = await PATCH_BULK({ request } as any);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Nieprawidłowe dane wejściowe");
    });
  });

  describe("PATCH /api/flashcards/approve-by-document", () => {
    it("powinno zatwierdzić fiszki dla dokumentu", async () => {
      const mockFlashcards: FlashcardDto[] = [
        {
          id: "1",
          front_original: "Test 1",
          back_original: "Back 1",
          topic_id: "topic1",
          document_id: "doc1",
          source: "ai",
          is_approved: true,
          is_disabled: false,
          created_at: new Date().toISOString(),
          modification_percentage: 0,
        },
        {
          id: "2",
          front_original: "Test 2",
          back_original: "Back 2",
          topic_id: "topic1",
          document_id: "doc1",
          source: "ai",
          is_approved: true,
          is_disabled: false,
          created_at: new Date().toISOString(),
          modification_percentage: 0,
        },
      ];

      const mockResult = {
        approved_count: 2,
        flashcards: mockFlashcards,
      };

      vi.mocked(FlashcardsService.prototype.approveByDocument).mockResolvedValueOnce(mockResult);

      const request = new Request("http://localhost/api/flashcards/approve-by-document", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id: "doc1" }),
      });

      const response = await PATCH_BY_DOCUMENT({ request } as any);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.data.approved_count).toBe(2);
      expect(body.data.flashcards).toHaveLength(2);
    });

    it("powinno obsłużyć nieistniejący dokument", async () => {
      vi.mocked(FlashcardsService.prototype.approveByDocument).mockRejectedValueOnce(
        new Error("Dokument nie istnieje")
      );

      const request = new Request("http://localhost/api/flashcards/approve-by-document", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id: "invalid" }),
      });

      const response = await PATCH_BY_DOCUMENT({ request } as any);
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toBe("Nie znaleziono dokumentu o podanym identyfikatorze");
    });

    it("powinno obsłużyć błąd walidacji", async () => {
      const request = new Request("http://localhost/api/flashcards/approve-by-document", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id: "invalid-uuid" }),
      });

      const response = await PATCH_BY_DOCUMENT({ request } as any);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Nieprawidłowe dane wejściowe");
    });
  });
}); 