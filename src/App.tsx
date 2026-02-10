import { useEffect } from "react";
import { useQuiz } from "./hooks/useQuiz";
import Home from "./components/pages/Home";

function App() {
  const { loadQuiz } = useQuiz();

  useEffect(() => {
    loadQuiz({ amount: 10, category: 11 });
  }, [loadQuiz]);

  return (
    <main className="background">
      <Home />
    </main>
  );
}

export default App;
