import Button from "../Button";

export default function Home() {
  return (
    <div className="flex justify-center flex-col items-center">
      <h1 className="text-2xl font-bold mb-8">Quizzical</h1>
      <Button>Start Quiz</Button>
    </div>
  );
}
