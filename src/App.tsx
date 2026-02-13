import { useQuiz } from "./hooks/useQuiz";
import HomeScreen from "./components/pages/HomeScreen";
import AnswersScreen from "./components/pages/AnswersScreen";
import QuestionsScreen from "./components/pages/QuestionsScreen";
import { QuizAnswersProvider } from "./context/answers/QuizAnswersProvider";

function App() {
  const {
    loadQuiz,
    hasCachedQuiz,
    questions,
    userAnswers,
    currentScreen,
    selectAnswers,
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

      <QuizAnswersProvider
        value={{ userAnswers: userAnswers, selectAnswers: selectAnswers }}
      >
        {currentScreen === "quiz_questions" && (
          <QuestionsScreen
            questionsList={questions}
            handleChangeView={changeScreen}
            error={error}
            isLoading={isLoading}
          />
        )}

        {currentScreen === "quiz_answers" && <AnswersScreen />}
      </QuizAnswersProvider>
    </main>
  );
}

export default App;
