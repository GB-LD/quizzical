export interface QuizQuestion {
  id: string;
  category: string;
  type: "multiple" | "boolean";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  correctAnswer: QuizAnswer;
  options: QuizAnswer[];
}

export interface QuizAnswer {
  id: string;
  text: string;
  isCorrectAnswer: boolean;
}

export interface QuizConfig {
  amount: number;
  category: number;
  difficulty?: "easy" | "medium" | "hard";
  type?: "multiple" | "boolean";
}

export interface QuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  userAnswers: Record<string, string>;
  isLoading: boolean;
  error: string | null;
}

export interface QuizCategory {
  id: number;
  name: string;
}
