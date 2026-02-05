import { useCallback, useState, useRef } from "react";
import { quizService } from "../services/quiz";
import { quizStorage, quizConfigStorage } from "../services/storage";
import type { QuizQuestion, QuizConfig } from "../services/quiz";
import {
  isApiError,
  isNetworkError,
  isValidationError,
  ERROR_MESSAGES,
} from "../utils/errors";

interface UseQuizReturn {
  questions: QuizQuestion[];
  isLoading: boolean;
  error: string | null;
  hasCachedQuiz: boolean;

  loadQuiz: (config?: QuizConfig) => Promise<void>;
  refetch: () => Promise<void>;
  clearError: () => void;
  clearCache: () => void;
}

const DEFAULT_CONFIG: QuizConfig = {
  amount: 10,
  category: 11,
};

export function useQuiz(): UseQuizReturn {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => {
    const cached = quizStorage.get();
    return cached || [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCachedQuiz, setHasCachedQuiz] = useState<boolean>(
    () => !!quizStorage.get(),
  );
  const lastConfig = useRef<QuizConfig>(
    quizConfigStorage.get() || DEFAULT_CONFIG,
  );
  const isRequestInFlight = useRef<boolean>(false);

  const loadQuiz = useCallback(async (config: QuizConfig = DEFAULT_CONFIG) => {
    if (isRequestInFlight.current) return;

    const cached = quizStorage.get();
    const cachedConfig = quizConfigStorage.get();
    const isSameConfig = cachedConfig
      ? checkIsSameConfig(cachedConfig, config)
      : false;

    if (cached && isSameConfig) {
      setQuestions(cached);
      return;
    }

    setIsLoading(true);
    setError(null);
    lastConfig.current = config;
    quizConfigStorage.save(config);

    try {
      isRequestInFlight.current = true;
      const data = await quizService.getQuiz(config);
      setQuestions(data);
      quizStorage.save(data);
      setHasCachedQuiz(true);
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err);
      setError(errorMessage);
      setQuestions([]);
      console.error("X Quiz loading failed:", err);
    } finally {
      isRequestInFlight.current = false;
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    quizStorage.remove();
    quizConfigStorage.remove();
    setHasCachedQuiz(false);
    await loadQuiz(lastConfig.current);
  }, [loadQuiz]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCache = useCallback(() => {
    quizStorage.remove();
    quizConfigStorage.remove();
    setQuestions([]);
    setHasCachedQuiz(false);
  }, []);

  return {
    questions,
    isLoading,
    error,
    hasCachedQuiz,
    loadQuiz,
    refetch,
    clearError,
    clearCache,
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
