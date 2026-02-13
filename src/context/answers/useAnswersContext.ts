import { useContext } from "react";
import {
  QuizAnswersContext,
  type QuizAnswersContextType,
} from "./QuizAnswersContext";

export function useAnswersContext(): QuizAnswersContextType {
  const context = useContext(QuizAnswersContext);
  if (!context) {
    throw new Error("useAnswers must be used within QuizAnswersProvider");
  }
  return context;
}
