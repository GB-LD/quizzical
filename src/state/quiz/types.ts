import type { QuizConfig, QuizQuestion } from "../../services/quiz";
import type { Screen } from "../../components/pages/types";

export type QuizStatus = "idle" | "loading" | "error" | "success";

export interface QuizState {
  status: QuizStatus;
  questions: QuizQuestion[];
  userAnswers: Record<string, string>;
  error: string | null;
  hasCachedQuiz: boolean;
  lastConfig: QuizConfig;
  currentScreen: Screen;
}

export type QuizAction =
  | { type: "LOAD_START"; config: QuizConfig }
  | { type: "LOAD_SUCCESS"; questions: QuizQuestion[] }
  | { type: "LOAD_ERROR"; message: string }
  | { type: "CLEAR_ERROR" }
  | { type: "CLEAR_CACHE" }
  | { type: "CHANGE_SCREEN"; screen: Screen }
  | { type: "SELECT_ANSWER"; questionId: string; answerId: string };
