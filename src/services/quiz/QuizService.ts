import { httpClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type { ApiQuestion, ApiQuizResponse } from "../api/types";
import { ApiResponseCode } from "../api/constants";
import type { QuizQuestion, QuizConfig, QuizCategory } from "./types";
import { ValidationError } from "../../utils/errors";

export class QuizService {
  async getQuiz(config: QuizConfig): Promise<QuizQuestion[]> {
    const url = ENDPOINTS.quiz(
      config.amount,
      config.category,
      config.difficulty,
      config.type,
    );

    const data = await httpClient.get<ApiQuizResponse>(url);

    this.validateResponse(data);

    return data.results.map((item) => this.transformQuestion(item));
  }

  async getCategories(): Promise<QuizCategory[]> {
    const data = await httpClient.get<{ trivia_categories: QuizCategory[] }>(
      ENDPOINTS.categories,
    );
    return data.trivia_categories;
  }

  private validateResponse(data: ApiQuizResponse): void {
    if (data.response_code !== ApiResponseCode.SUCCESS) {
      const errorMessages: Record<number, string> = {
        [ApiResponseCode.NO_RESULTS]:
          "No questions found with these criteria",
        [ApiResponseCode.INVALID_PARAMETER]: "Invalid parameters",
        [ApiResponseCode.TOKEN_NOT_FOUND]: "Session expired",
        [ApiResponseCode.TOKEN_EMPTY]: "No more questions available",
        [ApiResponseCode.RATE_LIMIT]: "Too many requests, please wait",
      };

      const message =
        errorMessages[data.response_code] ||
        `API Error: code ${data.response_code}`;

      throw new ValidationError(message);
    }

    if (!data.results || data.results.length === 0) {
      throw new ValidationError("No questions returned by the API");
    }
  }

  private decodeHtml(html: string): string {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

  private transformQuestion(raw: ApiQuestion): QuizQuestion {
    const category = this.decodeHtml(raw.category);
    const question = this.decodeHtml(raw.question);
    const correctAnswer = this.decodeHtml(raw.correct_answer);
    const incorrectAnswers = raw.incorrect_answers.map((a) =>
      this.decodeHtml(a),
    );

    const allOptions = [correctAnswer, ...incorrectAnswers];
    const shuffledOptions = this.shuffleArray(allOptions);

    return {
      id: crypto.randomUUID(),
      category: category,
      type: raw.type,
      difficulty: raw.difficulty,
      question: question,
      correctAnswer: correctAnswer,
      options: shuffledOptions,
    };
  }
}

export const quizService = new QuizService();
