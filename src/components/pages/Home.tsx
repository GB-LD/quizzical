import Button from "../Button";
import type { Screen } from "./types";

interface HomeProps {
  hasCachedQuiz: boolean;
  handleChangeView: (view: Screen) => void;
  loadRandomQuiz: () => void;
}

export default function Home({
  hasCachedQuiz,
  handleChangeView,
  loadRandomQuiz,
}: HomeProps) {
  return (
    <section className="flex justify-center flex-col items-center">
      <h1 className="text-2xl font-bold mb-8">Quizzical</h1>
      {hasCachedQuiz && (
        <Button handleBtnClick={() => handleChangeView("quiz_questions")}>
          Continue Quiz
        </Button>
      )}
      <Button handleBtnClick={loadRandomQuiz}>New Random Quiz</Button>
    </section>
  );
}
