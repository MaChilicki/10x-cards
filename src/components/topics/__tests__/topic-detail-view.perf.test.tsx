import { Profiler } from "react";
import { render } from "@testing-library/react";
import TopicDetailView from "../topic-detail-view";
import { useTopicDetail } from "../hooks/use-topic-detail";
import { useDocumentsList } from "@/components/documents/hooks/use-documents-list";
import { useNavigate } from "@/hooks/use-navigate";
import { vi } from "vitest";

vi.mock("../hooks/use-topic-detail");
vi.mock("@/components/documents/hooks/use-documents-list");
vi.mock("@/hooks/use-navigate");

describe("TopicDetailView - Testy wydajnościowe", () => {
  const generateMockDocuments = (count: number) => {
    return Array.from({ length: count }, (_, index) => ({
      id: `doc-${index}`,
      name: `Document ${index}`,
      description: `Description ${index}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      flashcards_count: Math.floor(Math.random() * 10),
    }));
  };

  const mockTopic = {
    id: "1",
    name: "Test Topic",
    description: "Test Description",
    documents_count: 100,
    flashcards_count: 500,
    breadcrumbs: [],
  };

  const setupTest = (documentsCount: number) => {
    const mockDocuments = generateMockDocuments(documentsCount);
    const renderTimes: { phase: string; actualDuration: number }[] = [];

    (useNavigate as jest.Mock).mockReturnValue(vi.fn());
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
      pagination: {
        currentPage: 1,
        totalPages: Math.ceil(documentsCount / 12),
        totalItems: documentsCount,
        itemsPerPage: 12,
        availablePerPage: [12, 24, 36],
      },
      refetch: vi.fn(),
      setPage: vi.fn(),
      setPerPage: vi.fn(),
    });

    const onRender = (id: string, phase: string, actualDuration: number) => {
      renderTimes.push({ phase, actualDuration });
    };

    render(
      <Profiler id="TopicDetailView" onRender={onRender}>
        <TopicDetailView topicId="1" />
      </Profiler>
    );

    return renderTimes;
  };

  test("wydajność renderowania dla różnych liczb dokumentów", () => {
    const scenarios = [10, 50, 100];
    const results: Record<number, number> = {};

    scenarios.forEach((count) => {
      const renderTimes = setupTest(count);
      const avgRenderTime =
        renderTimes.reduce((sum, { actualDuration }) => sum + actualDuration, 0) / renderTimes.length;
      results[count] = avgRenderTime;
    });

    // Sprawdź, czy czas renderowania rośnie liniowo (lub lepiej)
    // a nie wykładniczo wraz ze wzrostem liczby dokumentów
    const ratio1 = results[50] / results[10];
    const ratio2 = results[100] / results[50];

    expect(ratio2 / ratio1).toBeLessThanOrEqual(1.2); // Maksymalny dopuszczalny wzrost to 20%
  });

  test("wydajność pierwszego renderowania", () => {
    const renderTimes = setupTest(50);
    const initialRender = renderTimes[0];

    expect(initialRender.actualDuration).toBeLessThan(100); // Maksymalny czas pierwszego renderowania to 100ms
  });

  test("wydajność ponownego renderowania", () => {
    const renderTimes = setupTest(50);
    const rerender = renderTimes[1];

    expect(rerender.actualDuration).toBeLessThan(50); // Maksymalny czas ponownego renderowania to 50ms
  });
});
