import Button from "../Button";
import { useState } from "react";
import {
  triviaCategories,
  quizDifficulties,
} from "../../services/api/constants";
import type { QuizConfig } from "../../services/quiz";

interface ConfigQuizScreenProps {
  loadCustomQuiz: (quizConfig: QuizConfig) => void;
}

export default function ConfigQuizScreen({
  loadCustomQuiz,
}: ConfigQuizScreenProps) {
  const [rangeValue, setRangeValue] = useState(10);

  function handleChangeRange(e: React.ChangeEvent<HTMLInputElement>): void {
    if (e.target && e.target.value) setRangeValue(Number(e.target.value));
  }

  function getPersonalQuiz(formData: FormData) {
    const numOfQuestions = formData.get("numOfQuestions");
    const category = formData.get("category");
    const difficulty = formData.get("difficulty");
    const quizConfig: QuizConfig = {
      amount: numOfQuestions ? Number(numOfQuestions) : 5,
      category: category ? Number(category) : undefined,
      difficulty: difficulty
        ? (difficulty as QuizConfig["difficulty"])
        : undefined,
    };
    loadCustomQuiz(quizConfig);
  }

  return (
    <section className="flex flex-col justify-center items-center w-4/5 lg:w-3/5">
      <form
        action={getPersonalQuiz}
        className="border border-divider rounded-lg p-8"
      >
        <label className="block mb-2" htmlFor="numOfQuestions">
          Number of questions :
          <span className="font-semibold"> {rangeValue}</span>
        </label>
        <input
          className="range mb-8"
          type="range"
          id="numOfQuestions"
          name="numOfQuestions"
          min={5}
          max={20}
          value={rangeValue}
          onChange={(e) => handleChangeRange(e)}
        />
        <label htmlFor="category" className="block mb-2">
          Select category:
        </label>
        <select id="category" name="category" className="select lg:w-64 mb-8">
          <option value="">Any Category</option>
          {triviaCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label htmlFor="difficulty" className="block mb-2">
          Select Difficulty:
        </label>
        <select
          name="difficulty"
          id="difficulty"
          className="select lg:w-64 mb-8"
        >
          <option value="">Any Difficulty</option>
          {quizDifficulties.map((d) => (
            <option key={d.toLowerCase()} value={d.toLowerCase()}>
              {d}
            </option>
          ))}
        </select>
        <Button className="block btn-secondary btn-sm mx-auto">
          Get the quiz
        </Button>
      </form>
    </section>
  );
}
