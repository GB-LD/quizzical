import type { QuizQuestion } from "../services/quiz";
import AnswersList from "./AnswersChoicesList";

interface QuestionWrapperProps {
  question: QuizQuestion;
}

export default function QuestionWrapper({ question }: QuestionWrapperProps) {
  return (
    <>
      <p className="font-bold lg:text-lg text-primary-dark mb-3">
        {question.question}
      </p>
      <AnswersList questionId={question.id} answersList={question.options} />
    </>
  );
}
