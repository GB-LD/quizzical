import { cn } from "../utils/tailwind-cn";
import { useAnswersContext } from "../context/answers/useAnswersContext";

interface AnswerProps {
  children: React.ReactNode;
  questionId: string;
  answerId: string;
  isCorrectAnswer: boolean;
}

export default function Answer({
  questionId,
  answerId,
  children,
  isCorrectAnswer,
}: AnswerProps) {
  const { userAnswers, selectAnswers, currentScreen } = useAnswersContext();

  const handleAnswerClick = (answerId: string) =>
    selectAnswers(questionId, answerId);

  const isAnswerScreen = currentScreen === "quiz_answers";
  const isSelected =
    currentScreen === "quiz_questions" &&
    userAnswers &&
    userAnswers[questionId] === answerId;
  const isCorrect = isAnswerScreen && isCorrectAnswer === true;
  const isIncorrect =
    isAnswerScreen &&
    userAnswers[questionId] === answerId &&
    isCorrectAnswer === false;

  return (
    <button
      className={cn(
        "answer",
        isSelected && "answer-selected",
        isCorrect && "answer-correct",
        isIncorrect && "answer-incorrect",
      )}
      onClick={() => handleAnswerClick(answerId)}
      disabled={currentScreen === "quiz_answers"}
    >
      {children}
    </button>
  );
}
