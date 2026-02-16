import type { QuizQuestion } from "../../services/quiz";
import QuestionWrapper from "../QuestionWrapper";

interface AnswerScreenProps {
  questionsList: QuizQuestion[];
  handleChangeView: (view: Screen) => void;
}

export default function AnswerScreen({ questionsList }: AnswerScreenProps) {
  return (
    <section className="flex flex-col justify-center items-center">
      <ul className="w-4/5 mb-5">
        {questionsList.map((question) => (
          <li
            key={question.id}
            className="pb-3.5 not-last:mb-3.5 border-b border-divider"
          >
            <QuestionWrapper question={question} />
          </li>
        ))}
      </ul>
      
      
    </section>
  );
}
