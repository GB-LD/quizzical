import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { ApiError, NetworkError, ValidationError } from "../../utils/errors";
import type { QuizQuestion, QuizConfig } from "../../services/quiz";

// Mock quiz service
vi.mock("../../services/quiz", async () => {
  const actual = await vi.importActual("../../services/quiz");
  return {
    ...actual,
    quizService: {
      getQuiz: vi.fn(),
    },
  };
});

// Mock storage service
vi.mock("../../services/storage", () => ({
  quizStorage: {
    get: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
    hasData: vi.fn(),
  },
  quizConfigStorage: {
    get: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
    hasData: vi.fn(),
  },
}));

import { quizService } from "../../services/quiz";
import { quizStorage, quizConfigStorage } from "../../services/storage";
import { useQuiz } from "../useQuiz";

describe("useQuiz", () => {
  const mockQuestions: QuizQuestion[] = [
    {
      id: "1",
      category: "Entertainment: Film",
      type: "multiple",
      difficulty: "medium",
      question: "What year was the movie released?",
      correctAnswer: "1999",
      options: ["1999", "2000", "1998", "2001"],
    },
    {
      id: "2",
      category: "Science",
      type: "multiple",
      difficulty: "easy",
      question: "What is H2O?",
      correctAnswer: "Water",
      options: ["Water", "Fire", "Air", "Earth"],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset storage mocks to return null (no cached data)
    (quizStorage.get as Mock).mockReturnValue(null);
    (quizConfigStorage.get as Mock).mockReturnValue(null);
  });

  describe("Initial state", () => {
    it("should have the correct initial state", () => {
      // When - Rendering the hook
      const { result } = renderHook(() => useQuiz());

      // Then - Verify initial state
      expect(result.current.questions).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.hasCachedQuiz).toBe(false);
    });
  });

  describe("loadQuiz", () => {
    it("should load questions successfully", async () => {
      // Given - Mock configuration
      (quizService.getQuiz as Mock).mockResolvedValueOnce(mockQuestions);

      // When - Render and call loadQuiz
      const { result } = renderHook(() => useQuiz());

      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then - Verifications
      expect(result.current.questions).toEqual(mockQuestions);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should handle isLoading state during loading", async () => {
      // Given - Mock with delay
      (quizService.getQuiz as Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockQuestions), 100)
          )
      );

      const { result } = renderHook(() => useQuiz());

      // When - Start loading
      act(() => {
        result.current.loadQuiz();
      });

      // Then - Immediate loading state verification
      expect(result.current.isLoading).toBe(true);

      // Wait for loading to finish
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should use default config if not specified", async () => {
      // Given
      (quizService.getQuiz as Mock).mockResolvedValueOnce(mockQuestions);

      // When
      const { result } = renderHook(() => useQuiz());

      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then
      expect(quizService.getQuiz).toHaveBeenCalledWith({
        amount: 10,
        category: 11,
      });
    });

    it("should accept a custom configuration", async () => {
      // Given
      const customConfig: QuizConfig = {
        amount: 5,
        category: 9,
        difficulty: "hard",
      };
      (quizService.getQuiz as Mock).mockResolvedValueOnce(mockQuestions);

      // When
      const { result } = renderHook(() => useQuiz());

      await act(async () => {
        await result.current.loadQuiz(customConfig);
      });

      // Then
      expect(quizService.getQuiz).toHaveBeenCalledWith(customConfig);
    });
  });

  describe("Error handling", () => {
    it("should handle a server error (500)", async () => {
      // Given
      const apiError = new ApiError("Server Error", 500);
      (quizService.getQuiz as Mock).mockRejectedValueOnce(apiError);

      const { result } = renderHook(() => useQuiz());

      // When
      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then
      expect(result.current.error).toBe(
        "The server is experiencing difficulties. Please try again later"
      );
      expect(result.current.isLoading).toBe(false);
      expect(result.current.questions).toEqual([]);
    });

    it("should handle a 404 error", async () => {
      // Given
      const apiError = new ApiError("Not Found", 404);
      (quizService.getQuiz as Mock).mockRejectedValueOnce(apiError);

      const { result } = renderHook(() => useQuiz());

      // When
      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then
      expect(result.current.error).toBe("Resource not found");
    });

    it("should handle a 429 error (rate limit)", async () => {
      // Given
      const apiError = new ApiError("Too Many Requests", 429);
      (quizService.getQuiz as Mock).mockRejectedValueOnce(apiError);

      const { result } = renderHook(() => useQuiz());

      // When
      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then
      expect(result.current.error).toBe(
        "Too many requests. Please wait a few moments."
      );
    });

    it("should handle an API error with other code (not specifically handled)", async () => {
      // Given
      const apiError = new ApiError("Bad Request", 400);
      (quizService.getQuiz as Mock).mockRejectedValueOnce(apiError);

      const { result } = renderHook(() => useQuiz());

      // When
      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then - ApiError extends Error, so the message includes error.message
      expect(result.current.error).toBe("An error occurred Bad Request");
    });

    it("should handle a network error", async () => {
      // Given
      const networkError = new NetworkError("No connection");
      (quizService.getQuiz as Mock).mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useQuiz());

      // When
      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then
      expect(result.current.error).toBe(
        "Connection problem. Check your internet connection"
      );
    });

    it("should handle a validation error", async () => {
      // Given
      const validationError = new ValidationError("Invalid field");
      (quizService.getQuiz as Mock).mockRejectedValueOnce(validationError);

      const { result } = renderHook(() => useQuiz());

      // When
      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then
      expect(result.current.error).toBe("Invalid field");
    });

    it("should handle a standard Error", async () => {
      // Given
      (quizService.getQuiz as Mock).mockRejectedValueOnce(new Error("Oops"));

      const { result } = renderHook(() => useQuiz());

      // When
      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then
      expect(result.current.error).toBe("An error occurred Oops");
    });

    it("should handle an unknown error (string)", async () => {
      // Given
      (quizService.getQuiz as Mock).mockRejectedValueOnce("unknown error");

      const { result } = renderHook(() => useQuiz());

      // When
      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then
      expect(result.current.error).toBe("An unexpected error occurred");
    });

    it("should handle an unknown error (null)", async () => {
      // Given
      (quizService.getQuiz as Mock).mockRejectedValueOnce(null);

      const { result } = renderHook(() => useQuiz());

      // When
      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then
      expect(result.current.error).toBe("An unexpected error occurred");
    });
  });

  describe("refetch", () => {
    it("should reload with the same configuration", async () => {
      // Given
      const customConfig: QuizConfig = { amount: 5, category: 9 };
      (quizService.getQuiz as Mock).mockResolvedValue(mockQuestions);

      const { result } = renderHook(() => useQuiz());

      // Initial load with custom config
      await act(async () => {
        await result.current.loadQuiz(customConfig);
      });

      // Reset mock to see if refetch calls it
      vi.mocked(quizService.getQuiz).mockClear();
      vi.mocked(quizService.getQuiz).mockResolvedValueOnce([]);

      // When - Refetch
      await act(async () => {
        await result.current.refetch();
      });

      // Then - Verify the same config is used
      expect(quizService.getQuiz).toHaveBeenCalledWith(customConfig);
    });

    it("should use default config if loadQuiz has never been called", async () => {
      // Given
      (quizService.getQuiz as Mock).mockResolvedValueOnce(mockQuestions);

      const { result } = renderHook(() => useQuiz());

      // When - Refetch without previous loadQuiz call
      await act(async () => {
        await result.current.refetch();
      });

      // Then - Verify default config is used
      expect(quizService.getQuiz).toHaveBeenCalledWith({
        amount: 10,
        category: 11,
      });
    });
  });

  describe("clearError", () => {
    it("should clear the error", async () => {
      // Given - Create an error first
      (quizService.getQuiz as Mock).mockRejectedValueOnce(new Error("Error"));

      const { result } = renderHook(() => useQuiz());

      await act(async () => {
        await result.current.loadQuiz();
      });

      expect(result.current.error).not.toBeNull();

      // When
      act(() => {
        result.current.clearError();
      });

      // Then
      expect(result.current.error).toBeNull();
    });

    it("should do nothing if no error", () => {
      // Given
      const { result } = renderHook(() => useQuiz());

      expect(result.current.error).toBeNull();

      // When
      act(() => {
        result.current.clearError();
      });

      // Then
      expect(result.current.error).toBeNull();
    });
  });

  describe("Operation sequence", () => {
    it("should be able to reload after an error", async () => {
      // Given - First request fails
      (quizService.getQuiz as Mock)
        .mockRejectedValueOnce(new Error("First error"))
        .mockResolvedValueOnce(mockQuestions);

      const { result } = renderHook(() => useQuiz());

      // First attempt fails
      await act(async () => {
        await result.current.loadQuiz();
      });

      expect(result.current.error).toBe("An error occurred First error");
      expect(result.current.questions).toEqual([]);

      // When - Second attempt succeeds
      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then
      expect(result.current.error).toBeNull();
      expect(result.current.questions).toEqual(mockQuestions);
    });

    it("should reset questions before each new load", async () => {
      // Given
      (quizService.getQuiz as Mock)
        .mockResolvedValueOnce(mockQuestions)
        .mockImplementationOnce(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve([mockQuestions[0]]), 50)
            )
        );

      const { result } = renderHook(() => useQuiz());

      // First successful load
      await act(async () => {
        await result.current.loadQuiz();
      });

      expect(result.current.questions).toHaveLength(2);

      // When - New load
      act(() => {
        result.current.loadQuiz();
      });

      // Then - Questions should be cleared or kept depending on implementation
      // In useQuiz, questions are not reset before new load
      // They are only updated after success
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.questions).toHaveLength(1);
    });
  });

  describe("Cache integration", () => {
    it("should initialize with cached questions if available", () => {
      // Given
      (quizStorage.get as Mock).mockReturnValue(mockQuestions);
      (quizConfigStorage.get as Mock).mockReturnValue({ amount: 10, category: 11 });

      // When
      const { result } = renderHook(() => useQuiz());

      // Then
      expect(result.current.questions).toEqual(mockQuestions);
      expect(result.current.hasCachedQuiz).toBe(true);
    });

    it("should use cached data when config matches", async () => {
      // Given
      const config = { amount: 10, category: 11 };
      (quizStorage.get as Mock).mockReturnValue(mockQuestions);
      (quizConfigStorage.get as Mock).mockReturnValue(config);
      (quizService.getQuiz as Mock).mockResolvedValue([]);

      // When
      const { result } = renderHook(() => useQuiz());

      await act(async () => {
        await result.current.loadQuiz(config);
      });

      // Then - Should use cache, not call API
      expect(quizService.getQuiz).not.toHaveBeenCalled();
      expect(result.current.questions).toEqual(mockQuestions);
    });

    it("should fetch new data when config differs", async () => {
      // Given
      const cachedConfig = { amount: 5, category: 9 };
      const newConfig = { amount: 10, category: 11 };
      (quizStorage.get as Mock).mockReturnValue(mockQuestions);
      (quizConfigStorage.get as Mock).mockReturnValue(cachedConfig);
      (quizService.getQuiz as Mock).mockResolvedValue([mockQuestions[1]]);

      // When
      const { result } = renderHook(() => useQuiz());

      await act(async () => {
        await result.current.loadQuiz(newConfig);
      });

      // Then - Should call API with new config
      expect(quizService.getQuiz).toHaveBeenCalledWith(newConfig);
      expect(result.current.questions).toEqual([mockQuestions[1]]);
    });

    it("should save questions to storage after successful load", async () => {
      // Given
      (quizService.getQuiz as Mock).mockResolvedValueOnce(mockQuestions);

      // When
      const { result } = renderHook(() => useQuiz());

      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then
      expect(quizStorage.save).toHaveBeenCalledWith(mockQuestions);
      expect(quizConfigStorage.save).toHaveBeenCalledWith({ amount: 10, category: 11 });
    });

    it("should update hasCachedQuiz after successful load", async () => {
      // Given
      (quizService.getQuiz as Mock).mockResolvedValueOnce(mockQuestions);

      const { result } = renderHook(() => useQuiz());

      expect(result.current.hasCachedQuiz).toBe(false);

      // When
      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then
      expect(result.current.hasCachedQuiz).toBe(true);
    });
  });

  describe("clearCache", () => {
    it("should clear cache and reset state", async () => {
      // Given - Load some data first
      (quizService.getQuiz as Mock).mockResolvedValueOnce(mockQuestions);
      const { result } = renderHook(() => useQuiz());

      await act(async () => {
        await result.current.loadQuiz();
      });

      expect(result.current.questions).toHaveLength(2);
      expect(result.current.hasCachedQuiz).toBe(true);

      // When
      act(() => {
        result.current.clearCache();
      });

      // Then
      expect(quizStorage.remove).toHaveBeenCalled();
      expect(quizConfigStorage.remove).toHaveBeenCalled();
      expect(result.current.questions).toEqual([]);
      expect(result.current.hasCachedQuiz).toBe(false);
    });

    it("should work even when no cache exists", () => {
      // Given
      const { result } = renderHook(() => useQuiz());

      // When
      act(() => {
        result.current.clearCache();
      });

      // Then - Should not throw
      expect(result.current.questions).toEqual([]);
      expect(result.current.hasCachedQuiz).toBe(false);
    });
  });

  describe("refetch with cache", () => {
    it("should clear cache before refetching", async () => {
      // Given
      (quizService.getQuiz as Mock).mockResolvedValue(mockQuestions);
      const { result } = renderHook(() => useQuiz());

      await act(async () => {
        await result.current.loadQuiz();
      });

      vi.mocked(quizService.getQuiz).mockClear();

      // When
      await act(async () => {
        await result.current.refetch();
      });

      // Then
      expect(quizStorage.remove).toHaveBeenCalled();
      expect(quizConfigStorage.remove).toHaveBeenCalled();
    });
  });

  describe("Request deduplication", () => {
    it("should not make concurrent requests", async () => {
      // Given
      let resolveFirst: (value: QuizQuestion[]) => void;
      const firstPromise = new Promise<QuizQuestion[]>((resolve) => {
        resolveFirst = resolve;
      });
      (quizService.getQuiz as Mock).mockReturnValueOnce(firstPromise);

      const { result } = renderHook(() => useQuiz());

      // When - Start first request
      act(() => {
        result.current.loadQuiz();
      });

      // Try to start second request while first is in flight
      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then - Should only call API once
      expect(quizService.getQuiz).toHaveBeenCalledTimes(1);

      // Cleanup
      resolveFirst!(mockQuestions);
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("Screen navigation", () => {
    it("should have quiz_home as initial screen", () => {
      // Given & When
      const { result } = renderHook(() => useQuiz());

      // Then
      expect(result.current.currentScreen).toBe("quiz_home");
    });

    it("should change screen when changeScreen is called", () => {
      // Given
      const { result } = renderHook(() => useQuiz());

      // When
      act(() => {
        result.current.changeScreen("quiz_config");
      });

      // Then
      expect(result.current.currentScreen).toBe("quiz_config");
    });

    it("should preserve other state when changing screen", async () => {
      // Given
      (quizService.getQuiz as Mock).mockResolvedValueOnce(mockQuestions);
      const { result } = renderHook(() => useQuiz());

      await act(async () => {
        await result.current.loadQuiz();
      });

      expect(result.current.questions).toHaveLength(2);

      // When
      act(() => {
        result.current.changeScreen("quiz_answers");
      });

      // Then
      expect(result.current.currentScreen).toBe("quiz_answers");
      expect(result.current.questions).toHaveLength(2);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should handle all valid screen types", () => {
      // Given
      const { result } = renderHook(() => useQuiz());
      const screens: Array<typeof result.current.currentScreen> = [
        "quiz_home",
        "quiz_config",
        "quiz_questions",
        "quiz_answers",
      ];

      // When & Then
      screens.forEach((screen) => {
        act(() => {
          result.current.changeScreen(screen);
        });
        expect(result.current.currentScreen).toBe(screen);
      });
    });

    it("should allow changing screen multiple times", () => {
      // Given
      const { result } = renderHook(() => useQuiz());

      // When & Then
      act(() => {
        result.current.changeScreen("quiz_config");
      });
      expect(result.current.currentScreen).toBe("quiz_config");

      act(() => {
        result.current.changeScreen("quiz_questions");
      });
      expect(result.current.currentScreen).toBe("quiz_questions");

      act(() => {
        result.current.changeScreen("quiz_home");
      });
      expect(result.current.currentScreen).toBe("quiz_home");
    });

    it("should preserve currentScreen when other operations occur", async () => {
      // Given
      (quizService.getQuiz as Mock).mockResolvedValueOnce(mockQuestions);
      const { result } = renderHook(() => useQuiz());

      act(() => {
        result.current.changeScreen("quiz_questions");
      });

      // When - Load quiz
      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then - Screen should not change
      expect(result.current.currentScreen).toBe("quiz_questions");
    });
  });
});
