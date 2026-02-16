import { cn } from "../utils/tailwind-cn";
import { useAnswersContext } from "../context/answers/useAnswersContext";

interface AnswerProps {
  children: React.ReactNode;
  questionId: string;
  answerId: string;
}

export default function Answer({
  questionId,
  answerId,
  children,
}: AnswerProps) {
  const { userAnswers, selectAnswers } = useAnswersContext();

  const handleAnswerClick = (answerId: string) =>
    selectAnswers(questionId, answerId);

  const isSelected = userAnswers && userAnswers[questionId] === answerId;

  return (
    <button
      className={cn("answer", isSelected && "answer-selected")}
      onClick={() => handleAnswerClick(answerId)}
    >
      {children}
    </button>
  );
}
