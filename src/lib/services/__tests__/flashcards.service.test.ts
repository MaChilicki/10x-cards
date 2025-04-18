import { describe, it, expect, vi, beforeEach } from "vitest";
import { FlashcardsService } from "../flashcards.service";
import type { FlashcardDto, FlashcardSource } from "../../../types";
import { logger } from "../logger.service";

// Mock dla Supabase
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  single: vi.fn(),
  range: vi.fn().mockReturnThis(),
};

// Mock dla logger
vi.mock("../logger.service", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("FlashcardsService", () => {
  let service: FlashcardsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FlashcardsService(mockSupabase as any);
  });

  describe("getFlashcardById", () => {
    it("powinno zwrócić fiszkę po ID", async () => {
      const mockFlashcard = {
        id: "123",
        front_original: "Test front",
        back_original: "Test back",
        topic_id: "456",
        document_id: "789",
        source: "manual" as FlashcardSource,
        is_approved: true,
        is_disabled: false,
      };

      mockSupabase.single.mockResolvedValueOnce({ data: mockFlashcard, error: null });

      const result = await service.getFlashcardById("123");

      expect(result).toBeDefined();
      expect(result?.id).toBe("123");
      expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
      expect(mockSupabase.eq).toHaveBeenCalledWith("id", "123");
    });

    it("powinno zwrócić null gdy fiszka nie istnieje", async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: null });

      const result = await service.getFlashcardById("123");

      expect(result).toBeNull();
    });

    it("powinno obsłużyć błąd bazy danych", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: new Error("Database error"),
      });

      await expect(service.getFlashcardById("123")).rejects.toThrow("Nie udało się pobrać fiszki");
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("approveBulk", () => {
    it("powinno zatwierdzić wiele fiszek", async () => {
      const mockFlashcards = [
        { id: "1", is_approved: true },
        { id: "2", is_approved: true },
      ];

      mockSupabase.select.mockResolvedValueOnce({ data: mockFlashcards, error: null });

      const result = await service.approveBulk(["1", "2"]);

      expect(result.approved_count).toBe(2);
      expect(result.flashcards).toHaveLength(2);
      expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
      expect(mockSupabase.in).toHaveBeenCalledWith("id", ["1", "2"]);
    });

    it("powinno obsłużyć błąd bazy danych", async () => {
      mockSupabase.select.mockResolvedValueOnce({
        data: null,
        error: new Error("Database error"),
      });

      await expect(service.approveBulk(["1", "2"])).rejects.toThrow("Nie udało się zatwierdzić fiszek");
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("approveByDocument", () => {
    it("powinno zatwierdzić fiszki dla dokumentu", async () => {
      // Mock dla sprawdzenia dokumentu
      mockSupabase.single
        .mockResolvedValueOnce({ data: { id: "doc1" }, error: null })
        // Mock dla aktualizacji fiszek
        .mockResolvedValueOnce({
          data: [
            { id: "1", document_id: "doc1", is_approved: true },
            { id: "2", document_id: "doc1", is_approved: true },
          ],
          error: null,
        });

      const result = await service.approveByDocument("doc1");

      expect(result.approved_count).toBe(2);
      expect(result.flashcards).toHaveLength(2);
      expect(mockSupabase.from).toHaveBeenCalledWith("documents");
      expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
      expect(mockSupabase.eq).toHaveBeenCalledWith("document_id", "doc1");
    });

    it("powinno zwrócić błąd gdy dokument nie istnieje", async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: null });

      await expect(service.approveByDocument("doc1")).rejects.toThrow("Dokument nie istnieje");
      expect(logger.error).toHaveBeenCalled();
    });

    it("powinno obsłużyć błąd bazy danych", async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: "doc1" },
        error: null,
      });

      mockSupabase.select.mockResolvedValueOnce({
        data: null,
        error: new Error("Database error"),
      });

      await expect(service.approveByDocument("doc1")).rejects.toThrow("Błąd podczas zatwierdzania fiszek");
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
