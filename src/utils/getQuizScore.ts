import type { QuizQuestion } from "../services/quiz";

interface Score {
  questionsLength: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

export function getQuizScore(
  userAnswers: Record<string, string>,
  questions: QuizQuestion[],
): Score {
  if (Object.keys(userAnswers).length !== questions.length)
    return {
      questionsLength: questions.length,
      correctAnswers: 0,
      incorrectAnswers: 0,
    };

  const correctAnswers = questions.filter(
    (question) => userAnswers[question.id] === question.correctAnswer.id,
  );

  return {
    questionsLength: questions.length,
    correctAnswers: correctAnswers.length,
    incorrectAnswers: questions.length - correctAnswers.length,
  };
}
