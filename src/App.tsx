import { useState } from "react";
import { useQuiz } from "./hooks/useQuiz";
import Home from "./components/pages/Home";
import Answers from "./components/pages/Answers";
import Questions from "./components/pages/Questions";
import Config from "./components/pages/Config";
import type { Screen } from "./components/pages/types";

function App() {
  const { loadQuiz, hasCachedQuiz, questions, clearCache, error, isLoading } =
    useQuiz();
  const [currentScreen, setCurrentScreen] = useState<Screen>("quiz_home");

  async function loadRandomQuiz() {
    clearCache();
    setCurrentScreen("quiz_questions");
    await loadQuiz({ amount: 10, category: 11 });
  }

  return (
    <main className="background flex justify-center items-center">
      {currentScreen === "quiz_home" && (
        <Home
          hasCachedQuiz={hasCachedQuiz}
          handleChangeView={setCurrentScreen}
        />
      )}

      {currentScreen === "quiz_config" && (
        <Config loadRandomQuiz={loadRandomQuiz} />
      )}

      {currentScreen === "quiz_questions" && (
        <Questions
          questionsList={questions}
          handleChangeView={setCurrentScreen}
          error={error}
          isLoading={isLoading}
        />
      )}

      {currentScreen === "quiz_answers" && <Answers />}
    </main>
  );
}

export default App;
