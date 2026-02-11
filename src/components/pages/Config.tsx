import Button from "../Button";

interface ConfigProps {
  loadRandomQuiz: () => void;
}

export default function Config({ loadRandomQuiz }: ConfigProps) {
  return (
    <section>
      <Button handleBtnClick={loadRandomQuiz}>New Random Quiz</Button>
    </section>
  );
}
