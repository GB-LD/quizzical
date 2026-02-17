import type { QuizQuestion } from "../../services/quiz";
import QuestionWrapper from "../QuestionWrapper";
import { getQuizScore } from "../../utils/getQuizScore";
import { useAnswersContext } from "../../context/answers/useAnswersContext";
import Button from "../Button";

interface AnswerScreenProps {
  questionsList: QuizQuestion[];
  handleNewGame: () => void;
}

export default function AnswerScreen({
  questionsList,
  handleNewGame,
}: AnswerScreenProps) {
  const { userAnswers } = useAnswersContext();
  const { questionsLength, correctAnswers } = getQuizScore(
    userAnswers,
    questionsList,
  );

  return (
    <section className="flex flex-col justify-center items-center">
      <ul className="w-4/5 mb-12">
        {questionsList.map((question) => (
          <li
            key={question.id}
            className="pb-3.5 not-last:mb-3.5 border-b border-divider"
          >
            <QuestionWrapper question={question} />
          </li>
        ))}
      </ul>
      <div className="flex flex-col justify-center items-center lg:flex-row">
        <p className="text-text-heading font-bold lg:text-lg mb-4 lg:m-0 lg:mr-4 lg:items-center">
          You scored {correctAnswers}/{questionsLength} correct answers
        </p>
        <Button className="btn-sm btn-outline" handleBtnClick={handleNewGame}>
          Play again
        </Button>
      </div>
    </section>
  );
}
