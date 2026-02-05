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
          <button className="retry-btn" onClick={refetch}>
            🔄 Try again
          </button>
        </div>
      )}
      {questions.length > 0 && (
        <main>
          {questions.map((q) => (
            <div key={q.id}>{q.question}</div>
          ))}
        </main>
      )}
      {hasCachedQuiz && <button onClick={handleNewQuiz}>New quiz</button>}
    </>
  );
}

export default App;
