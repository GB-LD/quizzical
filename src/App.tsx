import { useEffect } from "react";
import { useQuiz } from "./hooks/useQuiz";

function App() {
  const { questions, isLoading, error, loadQuiz, refetch } = useQuiz();

  useEffect(() => {
    loadQuiz({ amount: 10, category: 11 });
  }, [loadQuiz]);

  if (isLoading) {
    return (
      <div>
        <div aria-label="Chargement"></div>
        <p>Chargement des questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert">
        <p className="error-message">❌ {error}</p>
        <button className="retry-btn" onClick={refetch}>
          🔄 Réessayer
        </button>
      </div>
    );
  }

  return (
    <main>
      {questions.map((q) => (
        <div>{q.question}</div>
      ))}
    </main>
  );
}

export default App;
