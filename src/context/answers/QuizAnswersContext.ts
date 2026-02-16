import { createContext } from "react";
import type { Screen } from "../../components/pages/types";

export interface QuizAnswersContextType {
  userAnswers: Record<string, string>;
  selectAnswers: (questionId: string, answerId: string) => void;
  currentScreen: Screen;
}

export const QuizAnswersContext = createContext<QuizAnswersContextType | null>(
  null,
);
