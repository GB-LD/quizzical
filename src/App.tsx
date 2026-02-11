import { useQuiz } from "./hooks/useQuiz";
import Home from "./components/pages/Home";
import Answers from "./components/pages/Answers";
import Questions from "./components/pages/Questions";

function App() {
  const {
    loadQuiz,
    hasCachedQuiz,
    questions,
    currentScreen,
    clearCache,
    error,
    isLoading,
    changeScreen,
  } = useQuiz();

  async function loadRandomQuiz() {
    clearCache();
    changeScreen("quiz_questions");
    await loadQuiz({ amount: 10, category: 11 });
  }

  return (
    <main className="background flex justify-center items-center py-12 lg:py-24">
      {currentScreen === "quiz_home" && (
        <Home
          hasCachedQuiz={hasCachedQuiz}
          handleChangeView={changeScreen}
          loadRandomQuiz={loadRandomQuiz}
        />
      )}

      {currentScreen === "quiz_questions" && (
        <Questions
          questionsList={questions}
          handleChangeView={changeScreen}
          error={error}
          isLoading={isLoading}
        />
      )}

      {currentScreen === "quiz_answers" && <Answers />}
    </main>
  );
}

export default App;
