import { useQuiz } from "./hooks/useQuiz";
import HomeScreen from "./components/pages/HomeScreen";
import AnswersScreen from "./components/pages/AnswersScreen";
import QuestionsScreen from "./components/pages/QuestionsScreen";
import { QuizAnswersProvider } from "./context/answers/QuizAnswersProvider";
import ConfigQuizScreen from "./components/pages/ConfigQuizScreen";
import type { QuizConfig } from "./services/quiz";

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
    await loadQuiz({ amount: 5 });
  }

  async function loadCustomQuiz(quizConfig: QuizConfig) {
    clearCache();
    changeScreen("quiz_questions");
    await loadQuiz(quizConfig);
  }

  async function loadNewGameView() {
    clearCache();
    changeScreen("quiz_home");
  }

  return (
    <main className="background min-h-screen flex flex-col justify-center items-center py-12 lg:pb-24 lg:pt-12">
      {currentScreen === "quiz_home" && (
        <HomeScreen
          hasCachedQuiz={hasCachedQuiz}
          handleChangeView={changeScreen}
          loadRandomQuiz={loadRandomQuiz}
        />
      )}

      {currentScreen === "quiz_config" && (
        <ConfigQuizScreen loadCustomQuiz={loadCustomQuiz} />
      )}

      <QuizAnswersProvider
        value={{
          userAnswers: userAnswers ?? {},
          selectAnswers: selectAnswers,
          currentScreen: currentScreen,
        }}
      >
        {currentScreen === "quiz_questions" && (
          <QuestionsScreen
            questionsList={questions}
            handleChangeView={changeScreen}
            error={error}
            isLoading={isLoading}
          />
        )}

        {currentScreen === "quiz_answers" && (
          <AnswersScreen
            questionsList={questions}
            handleNewGame={loadNewGameView}
          />
        )}
      </QuizAnswersProvider>
      <a
        className="absolute bottom-2 text-xs underline cursor-pointer"
        href="https://github.com/GB-LD/quizzical"
        target="_blank"
      >
        Check quizzical repository
        <img
          className="w-4 h-4 ml-2 inline"
          src="/github-icon.svg"
          alt="github icon"
        />
      </a>
    </main>
  );
}

export default App;
