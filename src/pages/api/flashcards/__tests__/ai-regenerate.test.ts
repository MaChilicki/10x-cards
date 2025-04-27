import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIRoute } from "astro";
import { POST } from "../ai-regenerate";
import type { SupabaseClient } from "../../../../db/supabase.client";

// Mock dla locals.supabase
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  update: vi.fn().mockReturnThis(),
} as unknown as SupabaseClient;

// Mock dla AiGenerateService
const mockRegenerateFlashcards = vi.fn().mockResolvedValue({
  flashcards: [],
  disabled_count: 0,
});

vi.mock("../../../../lib/services/ai-generate.service", () => ({
  AiGenerateService: vi.fn().mockImplementation(() => ({
    regenerateFlashcards: mockRegenerateFlashcards,
  })),
}));

type APIContext = Parameters<APIRoute>[0];

describe("POST /api/flashcards/ai-regenerate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("powinien zwrócić błąd 415 dla nieprawidłowego Content-Type", async () => {
    const request = new Request("http://test.com", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
    });

    const response = await POST({ request, locals: { supabase: mockSupabase } } as APIContext);
    expect(response.status).toBe(415);
    const data = await response.json();
    expect(data.error.code).toBe("INVALID_CONTENT_TYPE");
  });

  it("powinien zwrócić błąd 400 dla nieprawidłowego JSON", async () => {
    const request = new Request("http://test.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid json",
    });

    const response = await POST({ request, locals: { supabase: mockSupabase } } as APIContext);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe("INVALID_JSON");
  });

  it("powinien zwrócić błąd 400 dla nieprawidłowych danych wejściowych", async () => {
    const request = new Request("http://test.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST({ request, locals: { supabase: mockSupabase } } as APIContext);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe("VALIDATION_ERROR");
  });

  it("powinien pomyślnie zregenerować fiszki dla poprawnego tekstu", async () => {
    const request = new Request("http://test.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "a".repeat(1000), // Minimalny wymagany tekst
      }),
    });

    const response = await POST({ request, locals: { supabase: mockSupabase } } as APIContext);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({
      flashcards: [],
      disabled_count: 0,
    });
  });
});
