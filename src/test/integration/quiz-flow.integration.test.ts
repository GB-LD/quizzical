import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { STORAGE_KEYS } from "../../services/storage/type";
import type { ApiQuizResponse } from "../../services/api/types";

const mockApiResponse: ApiQuizResponse = {
  response_code: 0,
  results: [
    {
      category: "Entertainment: Film",
      type: "multiple",
      difficulty: "medium",
      question: "What is the name of the robot in The Iron Giant?",
      correct_answer: "The Iron Giant",
      incorrect_answers: ["Hogarth", "Dean", "Kent"],
    },
    {
      category: "Entertainment: Film",
      type: "multiple",
      difficulty: "easy",
      question: "Who directed Jurassic Park?",
      correct_answer: "Steven Spielberg",
      incorrect_answers: ["James Cameron", "Ridley Scott", "George Lucas"],
    },
  ],
};

describe("Quiz Integration - Full Stack", () => {
  // Mock déterministe des UUIDs
  // Need enough UUIDs for: 4 answers per question + 1 question ID = 5 UUIDs per question
  const mockUUIDs = [
    "answer-1-correct", "answer-1-a", "answer-1-b", "answer-1-c", "question-1",
    "answer-2-correct", "answer-2-a", "answer-2-b", "answer-2-c", "question-2"
  ];
  let uuidIndex = 0;

  // Mock sessionStorage avec inspection
  const mockSessionStorage = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      getStore: () => store, // Pour debug
    };
  })();

  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.clear();
    uuidIndex = 0;

    // Mock console
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    // Mock crypto
    Object.defineProperty(globalThis, "crypto", {
      value: {
        randomUUID: () => mockUUIDs[uuidIndex++ % mockUUIDs.length],
      },
      configurable: true,
    });

    // Mock sessionStorage
    Object.defineProperty(window, "sessionStorage", {
      value: mockSessionStorage,
      configurable: true,
    });

    // Mock fetch
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // Import dynamique pour isolation
  async function loadUseQuiz() {
    vi.resetModules();
    const { useQuiz } = await import("../../hooks/useQuiz");
    return useQuiz;
  }

  describe("Complete flow", () => {
    it("should fetch, transform, cache, and update state", async () => {
      // Given
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockApiResponse),
      });

      const useQuiz = await loadUseQuiz();
      const { result } = renderHook(() => useQuiz());

      // When
      await act(async () => {
        await result.current.loadQuiz({ amount: 2, category: 11 });
      });

      // Then - Hook state
      expect(result.current.questions).toHaveLength(2);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();

      expect(result.current.questions[0].id).toBe("question-1");
      expect(result.current.questions[1].id).toBe("question-2");

      const cached = mockSessionStorage.getItem(STORAGE_KEYS.QUIZ_QUESTIONS);
      const parsed = JSON.parse(cached!);
      expect(parsed.version).toBe(1);
      expect(parsed.savedAt).toBeDefined();
      expect(parsed.data).toHaveLength(2);
    });
  });

  // Tests de retry
  describe("Retry mechanism", () => {
    it("should retry on 500 and succeed", async () => {
      fetchMock
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockApiResponse),
        });

      const useQuiz = await loadUseQuiz();
      const { result } = renderHook(() => useQuiz());

      await act(async () => {
        await result.current.loadQuiz();
      });

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(result.current.error).toBeNull();
    });
  });

  // Tests de déduplication
  describe("Request deduplication", () => {
    it("should not make concurrent requests", async () => {
      let callCount = 0;
      fetchMock.mockImplementation(() => {
        callCount++;
        return new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve(mockApiResponse),
              }),
            50,
          ),
        );
      });

      const useQuiz = await loadUseQuiz();
      const { result } = renderHook(() => useQuiz());

      await act(async () => {
        await Promise.all([
          result.current.loadQuiz(),
          result.current.loadQuiz(),
        ]);
      });

      expect(callCount).toBe(1);
    });
  });
});
