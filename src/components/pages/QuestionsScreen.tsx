import type { QuizQuestion } from "../../services/quiz";
import Button from "../Button";
import QuestionWrapper from "../QuestionWrapper";
import type { Screen } from "./types";

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
  return (
    <section className="flex flex-col justify-center items-center">
      {error && <p className="mb-2xl">{error}</p>}

      {isLoading && <span className="loading loading-xl mb-2xl"></span>}

      {questionsList.length >= 1 && (
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
      )}

      {!isLoading && (
        <Button
          className="btn-secondary btn-sm block mx-auto"
          handleBtnClick={() => handleChangeView("quiz_home")}
        >
          Back
        </Button>
      )}
    </section>
  );
}
