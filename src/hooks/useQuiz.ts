import { useCallback, useReducer, useRef } from "react";
import { quizService } from "../services/quiz";
import { quizStorage, quizConfigStorage } from "../services/storage";
import { quizReducer, type QuizState } from "../state/quiz";
import type { QuizQuestion, QuizConfig } from "../services/quiz";
import type { Screen } from "../components/pages/types";
import {
  isApiError,
  isNetworkError,
  isValidationError,
  ERROR_MESSAGES,
} from "../utils/errors";

interface UseQuizReturn {
  //states
  questions: QuizQuestion[];
  userAnswers: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  hasCachedQuiz: boolean;
  currentScreen: Screen;

  //actions
  selectAnswers: (questionId: string, answerId: string) => void;
  loadQuiz: (config?: QuizConfig) => Promise<void>;
  refetch: () => Promise<void>;
  clearError: () => void;
  clearCache: () => void;
  changeScreen: (screen: Screen) => void;
}

const DEFAULT_CONFIG: QuizConfig = {
  amount: 10,
  category: 11,
};

function getInitialState(): QuizState {
  return {
    status: "idle",
    questions: quizStorage.get() || [],
    userAnswers: {},
    error: null,
    hasCachedQuiz: !!quizStorage.get(),
    lastConfig: quizConfigStorage.get() || DEFAULT_CONFIG,
    currentScreen: "quiz_home",
  };
}

export function useQuiz(): UseQuizReturn {
  const [state, dispatch] = useReducer(quizReducer, undefined, getInitialState);
  const isLoadingRef = useRef(false);

  const loadQuiz = useCallback(async (config: QuizConfig = DEFAULT_CONFIG) => {
    // Synchronous check to prevent concurrent requests
    if (isLoadingRef.current) return;

    const cached = quizStorage.get();
    const cachedConfig = quizConfigStorage.get();
    const isSameConfig = cachedConfig
      ? checkIsSameConfig(cachedConfig, config)
      : false;

    if (cached && isSameConfig) {
      dispatch({ type: "LOAD_SUCCESS", questions: cached });
      return;
    }

    isLoadingRef.current = true;
    dispatch({ type: "LOAD_START", config });
    quizConfigStorage.save(config);

    try {
      const data = await quizService.getQuiz(config);
      quizStorage.save(data);
      dispatch({ type: "LOAD_SUCCESS", questions: data });
    } catch (err) {
      dispatch({
        type: "LOAD_ERROR",
        message: getUserFriendlyErrorMessage(err),
      });
      console.error("Quiz loading failed:", err);
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  const refetch = useCallback(async () => {
    quizStorage.remove();
    quizConfigStorage.remove();
    dispatch({ type: "CLEAR_CACHE" });
    await loadQuiz(state.lastConfig);
  }, [loadQuiz, state.lastConfig]);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const clearCache = useCallback(() => {
    quizStorage.remove();
    quizConfigStorage.remove();
    dispatch({ type: "CLEAR_CACHE" });
  }, []);

  const changeScreen = useCallback((screen: Screen) => {
    dispatch({ type: "CHANGE_SCREEN", screen });
  }, []);

  const selectAnswers = useCallback((questionId: string, answerId: string) => {
    dispatch({ type: "SELECT_ANSWER", questionId, answerId });
  }, []);

  return {
    questions: state.questions,
    userAnswers: state.userAnswers,
    isLoading: state.status === "loading",
    error: state.error,
    hasCachedQuiz: state.hasCachedQuiz,
    currentScreen: state.currentScreen,

    selectAnswers,
    loadQuiz,
    refetch,
    clearError,
    clearCache,
    changeScreen,
  };
}

function checkIsSameConfig(a: QuizConfig, b: QuizConfig): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function getUserFriendlyErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.status >= 500) {
      return ERROR_MESSAGES.SERVER_ERROR;
    }
    if (error.status === 404) {
      return ERROR_MESSAGES.NOT_FOUND;
    }
    if (error.status === 429) {
      return ERROR_MESSAGES.RATE_LIMIT;
    }
  }
  if (isNetworkError(error)) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  if (isValidationError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return `An error occurred ${error.message}`;
  }
  return "An unexpected error occurred";
}
