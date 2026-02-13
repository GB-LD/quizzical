import type { ReactNode } from "react";
import {
  QuizAnswersContext,
  type QuizAnswersContextType,
} from "./QuizAnswersContext";

interface QuizAnswersProviderProps {
  children: ReactNode;
  value: QuizAnswersContextType;
}

export function QuizAnswersProvider({
  children,
  value,
}: QuizAnswersProviderProps) {
  return (
    <QuizAnswersContext.Provider value={value}>
      {children}
    </QuizAnswersContext.Provider>
  );
}
