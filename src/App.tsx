import { useQuiz } from "./hooks/useQuiz";
import HomeScreen from "./components/pages/HomeScreen";
import AnswersScreen from "./components/pages/AnswersScreen";
import QuestionsScreen from "./components/pages/QuestionsScreen";

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
        <HomeScreen
          hasCachedQuiz={hasCachedQuiz}
          handleChangeView={changeScreen}
          loadRandomQuiz={loadRandomQuiz}
        />
      )}

      {currentScreen === "quiz_questions" && (
        <QuestionsScreen
          questionsList={questions}
          handleChangeView={changeScreen}
          error={error}
          isLoading={isLoading}
        />
      )}

      {currentScreen === "quiz_answers" && <AnswersScreen />}
    </main>
  );
}

export default App;
