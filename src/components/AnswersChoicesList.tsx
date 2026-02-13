import { cn } from "../utils/tailwind-cn";
import type { QuizAnswer } from "../services/quiz/types";
import { useAnswersContext } from "../context/answers/useAnswersContext";

interface AnswersListProps {
  answersList: QuizAnswer[];
  questionId: string;
}

export default function AnswersChoicesList({
  answersList,
  questionId,
}: AnswersListProps) {
  const { userAnswers, selectAnswers } = useAnswersContext();

  const handleAnswerClick = (answerId: string) =>
    selectAnswers(questionId, answerId);

  return (
    <ul className="flex flex-wrap gap-3">
      {answersList.map((answer) => {
        const isSelected = userAnswers[questionId] === answer.id;
        return (
          <li key={answer.id}>
            <button
              className={cn("answer", isSelected && "answer-selected")}
              onClick={() => handleAnswerClick(answer.id)}
            >
              {answer.text}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
