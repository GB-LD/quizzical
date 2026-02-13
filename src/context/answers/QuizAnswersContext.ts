import { createContext } from "react";

export interface QuizAnswersContextType {
  userAnswers: Record<string, string>;
  selectAnswers: (questionId: string, answerId: string) => void;
}

export const QuizAnswersContext =
 createContext<QuizAnswersContextType | null>(
  null,
);
