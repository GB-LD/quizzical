import { useEffect } from "react";
import { useQuiz } from "./hooks/useQuiz";

function App() {
  const {
    questions,
    isLoading,
    hasCachedQuiz,
    error,
    loadQuiz,
    refetch,
    clearCache,
  } = useQuiz();

  useEffect(() => {
    loadQuiz({ amount: 10, category: 11 });
  }, [loadQuiz]);

  function handleNewQuiz(): void {
    clearCache();
    loadQuiz();
  }

  return (
    <>
      {isLoading && (
        <div>
          <div aria-label="loading"></div>
          <p>questions loading...</p>
        </div>
      )}
      {error && (
        <div role="alert">
          <p className="error-message">❌ {error}</p>
          <button className="btn btn-secondary" onClick={refetch}>
            🔄 Try again
          </button>
        </div>
      )}
      {questions.length > 0 && (
        <main>
          {questions.map((q) => (
            <div className="question-block" key={q.id}>
              <div className="question-block__title">{q.question}</div>
              <ul className="flex flex-wrap gap-2">
                {q.options.map((answer) => (
                  <li className="answer">{answer}</li>
                ))}
              </ul>
            </div>
          ))}
        </main>
      )}
      {hasCachedQuiz && (
        <button className="btn btn-sm" onClick={handleNewQuiz}>
          New quiz
        </button>
      )}
    </>
  );
}

export default App;
