import { describe, it, expect } from "vitest";
import { quizReducer } from "../reducer";
import type { QuizState, QuizAction } from "../types";
import type { QuizQuestion, QuizConfig } from "../../../services/quiz";

describe("quizReducer", () => {
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

  const initialState: QuizState = {
    status: "idle",
    questions: [],
    error: null,
    hasCachedQuiz: false,
    lastConfig: { amount: 10, category: 11 },
    currentScreen: "quiz_home",
  };

  describe("LOAD_START", () => {
    it("should set status to loading and clear error", () => {
      // Given
      const stateWithError: QuizState = {
        ...initialState,
        error: "Previous error",
      };
      const action: QuizAction = {
        type: "LOAD_START",
        config: { amount: 5, category: 9 },
      };

      // When
      const newState = quizReducer(stateWithError, action);

      // Then
      expect(newState.status).toBe("loading");
      expect(newState.error).toBeNull();
    });

    it("should save the config in lastConfig", () => {
      // Given
      const config: QuizConfig = { amount: 15, category: 12, difficulty: "hard" };
      const action: QuizAction = {
        type: "LOAD_START",
        config,
      };

      // When
      const newState = quizReducer(initialState, action);

      // Then
      expect(newState.lastConfig).toEqual(config);
    });

    it("should preserve existing questions", () => {
      // Given
      const stateWithQuestions: QuizState = {
        ...initialState,
        questions: mockQuestions,
      };
      const action: QuizAction = {
        type: "LOAD_START",
        config: { amount: 10, category: 11 },
      };

      // When
      const newState = quizReducer(stateWithQuestions, action);

      // Then
      expect(newState.questions).toEqual(mockQuestions);
    });
  });

  describe("LOAD_SUCCESS", () => {
    it("should set questions and status to success", () => {
      // Given
      const loadingState: QuizState = {
        ...initialState,
        status: "loading",
      };
      const action: QuizAction = {
        type: "LOAD_SUCCESS",
        questions: mockQuestions,
      };

      // When
      const newState = quizReducer(loadingState, action);

      // Then
      expect(newState.status).toBe("success");
      expect(newState.questions).toEqual(mockQuestions);
    });

    it("should set hasCachedQuiz to true", () => {
      // Given
      const action: QuizAction = {
        type: "LOAD_SUCCESS",
        questions: mockQuestions,
      };

      // When
      const newState = quizReducer(initialState, action);

      // Then
      expect(newState.hasCachedQuiz).toBe(true);
    });

    it("should replace existing questions", () => {
      // Given
      const stateWithOldQuestions: QuizState = {
        ...initialState,
        questions: [mockQuestions[0]],
      };
      const action: QuizAction = {
        type: "LOAD_SUCCESS",
        questions: mockQuestions,
      };

      // When
      const newState = quizReducer(stateWithOldQuestions, action);

      // Then
      expect(newState.questions).toEqual(mockQuestions);
      expect(newState.questions).toHaveLength(2);
    });

    it("should clear error if any", () => {
      // Given
      const stateWithError: QuizState = {
        ...initialState,
        status: "error",
        error: "Failed to load",
      };
      const action: QuizAction = {
        type: "LOAD_SUCCESS",
        questions: mockQuestions,
      };

      // When
      const newState = quizReducer(stateWithError, action);

      // Then
      expect(newState.error).toBeNull();
    });
  });

  describe("LOAD_ERROR", () => {
    it("should set error message and status to error", () => {
      // Given
      const loadingState: QuizState = {
        ...initialState,
        status: "loading",
      };
      const errorMessage = "Network error occurred";
      const action: QuizAction = {
        type: "LOAD_ERROR",
        message: errorMessage,
      };

      // When
      const newState = quizReducer(loadingState, action);

      // Then
      expect(newState.status).toBe("error");
      expect(newState.error).toBe(errorMessage);
    });

    it("should clear questions on error", () => {
      // Given
      const stateWithQuestions: QuizState = {
        ...initialState,
        status: "loading",
        questions: mockQuestions,
      };
      const action: QuizAction = {
        type: "LOAD_ERROR",
        message: "Error",
      };

      // When
      const newState = quizReducer(stateWithQuestions, action);

      // Then
      expect(newState.questions).toEqual([]);
    });

    it("should preserve lastConfig on error", () => {
      // Given
      const config: QuizConfig = { amount: 5, category: 9 };
      const stateWithConfig: QuizState = {
        ...initialState,
        lastConfig: config,
      };
      const action: QuizAction = {
        type: "LOAD_ERROR",
        message: "Error",
      };

      // When
      const newState = quizReducer(stateWithConfig, action);

      // Then
      expect(newState.lastConfig).toEqual(config);
    });
  });

  describe("CLEAR_ERROR", () => {
    it("should clear error and set status to success if questions exist", () => {
      // Given
      const stateWithErrorAndQuestions: QuizState = {
        ...initialState,
        status: "error",
        error: "Some error",
        questions: mockQuestions,
      };
      const action: QuizAction = {
        type: "CLEAR_ERROR",
      };

      // When
      const newState = quizReducer(stateWithErrorAndQuestions, action);

      // Then
      expect(newState.error).toBeNull();
      expect(newState.status).toBe("success");
    });

    it("should clear error and set status to idle if no questions", () => {
      // Given
      const stateWithError: QuizState = {
        ...initialState,
        status: "error",
        error: "Some error",
        questions: [],
      };
      const action: QuizAction = {
        type: "CLEAR_ERROR",
      };

      // When
      const newState = quizReducer(stateWithError, action);

      // Then
      expect(newState.error).toBeNull();
      expect(newState.status).toBe("idle");
    });

    it("should preserve questions when clearing error", () => {
      // Given
      const stateWithErrorAndQuestions: QuizState = {
        ...initialState,
        error: "Some error",
        questions: mockQuestions,
      };
      const action: QuizAction = {
        type: "CLEAR_ERROR",
      };

      // When
      const newState = quizReducer(stateWithErrorAndQuestions, action);

      // Then
      expect(newState.questions).toEqual(mockQuestions);
    });
  });

  describe("CLEAR_CACHE", () => {
    it("should reset questions and hasCachedQuiz", () => {
      // Given
      const stateWithCache: QuizState = {
        ...initialState,
        questions: mockQuestions,
        hasCachedQuiz: true,
      };
      const action: QuizAction = {
        type: "CLEAR_CACHE",
      };

      // When
      const newState = quizReducer(stateWithCache, action);

      // Then
      expect(newState.questions).toEqual([]);
      expect(newState.hasCachedQuiz).toBe(false);
    });

    it("should set status to idle", () => {
      // Given
      const stateWithSuccess: QuizState = {
        ...initialState,
        status: "success",
        questions: mockQuestions,
      };
      const action: QuizAction = {
        type: "CLEAR_CACHE",
      };

      // When
      const newState = quizReducer(stateWithSuccess, action);

      // Then
      expect(newState.status).toBe("idle");
    });

    it("should preserve lastConfig when clearing cache", () => {
      // Given
      const config: QuizConfig = { amount: 5, category: 9 };
      const stateWithConfig: QuizState = {
        ...initialState,
        lastConfig: config,
        questions: mockQuestions,
      };
      const action: QuizAction = {
        type: "CLEAR_CACHE",
      };

      // When
      const newState = quizReducer(stateWithConfig, action);

      // Then
      expect(newState.lastConfig).toEqual(config);
    });

    it("should clear error when clearing cache", () => {
      // Given
      const stateWithError: QuizState = {
        ...initialState,
        error: "Some error",
        questions: mockQuestions,
      };
      const action: QuizAction = {
        type: "CLEAR_CACHE",
      };

      // When
      const newState = quizReducer(stateWithError, action);

      // Then
      expect(newState.error).toBeNull();
    });
  });

  describe("CHANGE_SCREEN", () => {
    it("should update currentScreen", () => {
      // Given
      const action: QuizAction = {
        type: "CHANGE_SCREEN",
        screen: "quiz_questions",
      };

      // When
      const newState = quizReducer(initialState, action);

      // Then
      expect(newState.currentScreen).toBe("quiz_questions");
    });

    it("should preserve all other state when changing screen", () => {
      // Given
      const stateWithData: QuizState = {
        status: "success",
        questions: mockQuestions,
        error: null,
        hasCachedQuiz: true,
        lastConfig: { amount: 5, category: 9 },
        currentScreen: "quiz_home",
      };
      const action: QuizAction = {
        type: "CHANGE_SCREEN",
        screen: "quiz_answers",
      };

      // When
      const newState = quizReducer(stateWithData, action);

      // Then
      expect(newState.currentScreen).toBe("quiz_answers");
      expect(newState.status).toBe("success");
      expect(newState.questions).toEqual(mockQuestions);
      expect(newState.error).toBeNull();
      expect(newState.hasCachedQuiz).toBe(true);
      expect(newState.lastConfig).toEqual({ amount: 5, category: 9 });
    });

    it("should handle all valid screen types", () => {
      // Given
      const screens: Array<QuizState["currentScreen"]> = [
        "quiz_home",
        "quiz_config",
        "quiz_questions",
        "quiz_answers",
      ];

      // When & Then
      screens.forEach((screen) => {
        const action: QuizAction = { type: "CHANGE_SCREEN", screen };
        const newState = quizReducer(initialState, action);
        expect(newState.currentScreen).toBe(screen);
      });
    });
  });

  describe("State immutability", () => {
    it("should not mutate the original state", () => {
      // Given
      const originalState: QuizState = {
        ...initialState,
        questions: mockQuestions,
      };
      const stateCopy = JSON.parse(JSON.stringify(originalState));
      const action: QuizAction = {
        type: "LOAD_SUCCESS",
        questions: [mockQuestions[0]],
      };

      // When
      quizReducer(originalState, action);

      // Then - Original state should remain unchanged
      expect(originalState).toEqual(stateCopy);
    });

    it("should return a new state object reference", () => {
      // Given
      const action: QuizAction = {
        type: "CHANGE_SCREEN",
        screen: "quiz_config",
      };

      // When
      const newState = quizReducer(initialState, action);

      // Then
      expect(newState).not.toBe(initialState);
    });

    it("should not mutate nested objects (questions array)", () => {
      // Given
      const stateWithQuestions: QuizState = {
        ...initialState,
        questions: mockQuestions,
      };
      const originalQuestions = stateWithQuestions.questions;
      const action: QuizAction = {
        type: "CHANGE_SCREEN",
        screen: "quiz_config",
      };

      // When
      const newState = quizReducer(stateWithQuestions, action);

      // Then
      expect(newState.questions).toBe(originalQuestions); // Same reference for unchanged data
    });
  });

  describe("Status transitions", () => {
    it("should transition from idle → loading → success", () => {
      // Given
      let state = initialState;

      // When - Start loading
      state = quizReducer(state, {
        type: "LOAD_START",
        config: { amount: 10, category: 11 },
      });
      expect(state.status).toBe("loading");

      // When - Load succeeds
      state = quizReducer(state, {
        type: "LOAD_SUCCESS",
        questions: mockQuestions,
      });

      // Then
      expect(state.status).toBe("success");
    });

    it("should transition from idle → loading → error", () => {
      // Given
      let state = initialState;

      // When - Start loading
      state = quizReducer(state, {
        type: "LOAD_START",
        config: { amount: 10, category: 11 },
      });
      expect(state.status).toBe("loading");

      // When - Load fails
      state = quizReducer(state, {
        type: "LOAD_ERROR",
        message: "Failed",
      });

      // Then
      expect(state.status).toBe("error");
    });

    it("should transition from error → idle after clearing cache", () => {
      // Given
      const errorState: QuizState = {
        ...initialState,
        status: "error",
        error: "Some error",
      };

      // When
      const newState = quizReducer(errorState, { type: "CLEAR_CACHE" });

      // Then
      expect(newState.status).toBe("idle");
    });

    it("should transition from error → success after clearing error with questions", () => {
      // Given
      const errorState: QuizState = {
        ...initialState,
        status: "error",
        error: "Some error",
        questions: mockQuestions,
      };

      // When
      const newState = quizReducer(errorState, { type: "CLEAR_ERROR" });

      // Then
      expect(newState.status).toBe("success");
    });
  });

  describe("Edge cases", () => {
    it("should handle LOAD_SUCCESS with empty questions array", () => {
      // Given
      const action: QuizAction = {
        type: "LOAD_SUCCESS",
        questions: [],
      };

      // When
      const newState = quizReducer(initialState, action);

      // Then
      expect(newState.questions).toEqual([]);
      expect(newState.status).toBe("success");
      expect(newState.hasCachedQuiz).toBe(true);
    });

    it("should handle LOAD_ERROR with empty message", () => {
      // Given
      const action: QuizAction = {
        type: "LOAD_ERROR",
        message: "",
      };

      // When
      const newState = quizReducer(initialState, action);

      // Then
      expect(newState.error).toBe("");
      expect(newState.status).toBe("error");
    });

    it("should handle clearing cache when already empty", () => {
      // Given
      const action: QuizAction = {
        type: "CLEAR_CACHE",
      };

      // When
      const newState = quizReducer(initialState, action);

      // Then
      expect(newState.questions).toEqual([]);
      expect(newState.hasCachedQuiz).toBe(false);
      expect(newState.status).toBe("idle");
    });
  });
});
