import type { QuizQuestion } from "../../services/quiz";
import Button from "../Button";
import type { Screen } from "./types";

interface QuestionsProps {
  questionsList: QuizQuestion[];
  handleChangeView: (view: Screen) => void;
  error: string | null;
  isLoading: boolean;
}

export default function Questions({
  questionsList,
  handleChangeView,
  error,
  isLoading,
}: QuestionsProps) {
  return (
    <section className="flex flex-col justify-center items-center">
      {error && <p className="mb-2xl">{error}</p>}
      {isLoading && <span className="loading loading-xl mb-2xl"></span>}
      {questionsList.length >= 1 && (
        <ul className="w-4/5 mb-5">
          {questionsList.map((q) => (
            <li
              className="pb-3.5 not-last:mb-3.5 border-b border-divider"
              key={q.id}
            >
              <p className="font-bold lg:text-lg text-primary-dark mb-3">
                {q.question}
              </p>
              <ul className="flex flex-wrap gap-3">
                {q.options.map((option) => (
                  <li className="answer">{option}</li>
                ))}
              </ul>
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
