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
        <ul className="w-full mb-2xl">
          {questionsList.map((q) => (
            <li key={q.id}>{q.question}</li>
          ))}
        </ul>
      )}
      <Button
        className="btn-secondary btn-sm block mx-auto"
        handleBtnClick={() => handleChangeView("quiz_config")}
      >
        Back
      </Button>
    </section>
  );
}
