export interface QuizQuestion {
  id: string;
  category: string;
  type: "multiple" | "boolean";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  correctAnswer: string;
  options: string[];
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
