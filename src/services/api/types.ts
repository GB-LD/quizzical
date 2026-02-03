import type { ApiResponseCodeType } from "./constants";

export interface ApiQuizResponse {
  response_code: ApiResponseCodeType;
  results: ApiQuestion[];
}

export interface ApiQuestion {
  category: string;
  type: "multiple" | "boolean";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface ApiCategory {
  id: number;
  name: string;
}

export interface ApiCategoriesResponse {
  trivia_categories: ApiCategory[];
}
