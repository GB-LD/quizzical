import type { QuizAnswer } from "../services/quiz/types";
import Answer from "./Answer";

interface AnswersListProps {
  answersList: QuizAnswer[];
  questionId: string;
}

export default function AnswersChoicesList({
  answersList,
  questionId,
}: AnswersListProps) {
  return (
    <ul className="flex flex-wrap gap-3">
      {answersList.map((answer) => (
        <li key={answer.id}>
          <Answer
            questionId={questionId}
            answerId={answer.id}
            isCorrectAnswer={answer.isCorrectAnswer}
          >
            {answer.text}
          </Answer>
        </li>
      ))}
    </ul>
  );
}
