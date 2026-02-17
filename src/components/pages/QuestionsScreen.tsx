import type { QuizQuestion } from "../../services/quiz";
import Button from "../Button";
import QuestionWrapper from "../QuestionWrapper";
import type { Screen } from "./types";
import { useAnswersContext } from "../../context/answers/useAnswersContext";

interface QuestionsScreenProps {
  questionsList: QuizQuestion[];
  handleChangeView: (view: Screen) => void;
  error: string | null;
  isLoading: boolean;
}

export default function QuestionsScreen({
  questionsList,
  handleChangeView,
  error,
  isLoading,
}: QuestionsScreenProps) {
  const { userAnswers } = useAnswersContext();

  const quizIsCompleted =
    userAnswers && Object.keys(userAnswers).length === questionsList.length;

  return (
    <section className="flex flex-col justify-center items-center">
      {error && <p className="mb-2xl">{error}</p>}

      {isLoading && <span className="loading loading-xl mb-2xl"></span>}

      {questionsList.length >= 1 && (
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
      )}

      <div className="flex flex-col lg:flex-row gap-4 w-2/4 md:w-1/5 lg:w-1/2">
        {!isLoading && (
          <>
            <Button
              className="btn-sm btn-outline flex-1"
              handleBtnClick={() => handleChangeView("quiz_home")}
            >
              Back
            </Button>
            <Button
              className="btn-sm btn-outline flex-1"
              isDisabled={!quizIsCompleted}
              handleBtnClick={() => handleChangeView("quiz_answers")}
            >
              Check answers
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
