import type { QuizAnswer } from "../services/quiz/types";

interface AnswersListProps {
  answersList: QuizAnswer[];
}

export default function AnswersChoicesList({ answersList }: AnswersListProps) {
  return (
    <ul className="flex flex-wrap gap-3">
      {answersList.map((answer) => (
        <li className="answer" key={answer.id}>
          <button>{answer.text}</button>
        </li>
      ))}
    </ul>
  );
}
