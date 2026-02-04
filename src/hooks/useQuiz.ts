import { useCallback, useState, useRef } from "react";
import { quizService } from "../services/quiz";
import type { QuizQuestion, QuizConfig } from "../services/quiz";
import { isApiError, isNetworkError, isValidationError } from "../utils/errors";

interface UseQuizReturn {
  questions: QuizQuestion[];
  isLoading: boolean;
  error: string | null;

  loadQuiz: (config?: QuizConfig) => Promise<void>;
  refetch: () => Promise<void>;
  clearError: () => void;
}

const DEFAULT_CONFIG: QuizConfig = {
  amount: 10,
  category: 11,
};

export function useQuiz(): UseQuizReturn {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const lastConfig = useRef<QuizConfig>(DEFAULT_CONFIG);

  const loadQuiz = useCallback(async (config: QuizConfig = DEFAULT_CONFIG) => {
    setIsLoading(true);
    setError(null);
    lastConfig.current = config;

    try {
      const data = await quizService.getQuiz(config);
      setQuestions(data);
    } catch (err) {
      const errorMessage = getUserFrendlyErrorMessage(err);
      setError(errorMessage);
      console.error("X Quiz loading failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await loadQuiz(lastConfig.current);
  }, [loadQuiz]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    questions,
    isLoading,
    error,
    loadQuiz,
    refetch,
    clearError,
  };
}

function getUserFrendlyErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.status >= 500) {
      return "The server is experiencing difficulties. Please try again later";
    }
    if (error.status === 404) {
      return "Resource not found";
    }
    if (error.status === 429) {
      return "Too many requests. Please wait a few moments.";
    }
  }
  if (isNetworkError(error)) {
    return "Connection problem. Check your internet connection";
  }
  if (isValidationError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return `An error occurred ${error.message}`;
  }
  return "An unexpected error occurred";
}
