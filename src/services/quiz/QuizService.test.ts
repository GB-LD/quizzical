import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { ApiResponseCode } from "../api/constants";
import type { ApiQuizResponse } from "../api/types";

// Mock httpClient
vi.mock("../api/client", () => ({
  httpClient: {
    get: vi.fn(),
  },
}));

import { httpClient } from "../api/client";
import { QuizService } from "./QuizService";

describe("QuizService", () => {
  let quizService: QuizService;

  beforeEach(() => {
    vi.clearAllMocks();
    quizService = new QuizService();
  });

  describe("getQuiz", () => {
    const mockConfig = {
      amount: 5,
      category: 11,
      difficulty: "medium" as const,
      type: "multiple" as const,
    };

    it("fetches and transforms questions correctly", async () => {
      const mockApiResponse: ApiQuizResponse = {
        response_code: ApiResponseCode.SUCCESS,
        results: [
          {
            category: "Entertainment: Film",
            type: "multiple",
            difficulty: "medium",
            question: "What year was the movie released?",
            correct_answer: "1999",
            incorrect_answers: ["2000", "1998", "2001"],
          },
        ],
      };

      (httpClient.get as Mock).mockResolvedValueOnce(mockApiResponse);

      const questions = await quizService.getQuiz(mockConfig);

      expect(questions).toHaveLength(1);
      expect(questions[0]).toMatchObject({
        category: "Entertainment: Film",
        type: "multiple",
        difficulty: "medium",
        question: "What year was the movie released?",
        correctAnswer: "1999",
      });
      expect(questions[0].options).toHaveLength(4);
      expect(questions[0].options).toContain("1999");
      expect(questions[0].options).toContain("2000");
      expect(questions[0].options).toContain("1998");
      expect(questions[0].options).toContain("2001");
      expect(questions[0].id).toBeDefined();
    });

    it("decodes HTML entities in questions", async () => {
      const mockApiResponse: ApiQuizResponse = {
        response_code: ApiResponseCode.SUCCESS,
        results: [
          {
            category: "Science &amp; Nature",
            type: "multiple",
            difficulty: "easy",
            question: "What is H&lt;sub&gt;2&lt;/sub&gt;O?",
            correct_answer: "Water",
            incorrect_answers: ["Fire", "Air", "Earth"],
          },
        ],
      };

      (httpClient.get as Mock).mockResolvedValueOnce(mockApiResponse);

      const questions = await quizService.getQuiz(mockConfig);

      expect(questions[0].category).toBe("Science & Nature");
      expect(questions[0].question).toBe("What is H<sub>2</sub>O?");
    });

    it("decodes HTML entities in answers", async () => {
      const mockApiResponse: ApiQuizResponse = {
        response_code: ApiResponseCode.SUCCESS,
        results: [
          {
            category: "General",
            type: "multiple",
            difficulty: "easy",
            question: "Test?",
            correct_answer: "Rock &amp; Roll",
            incorrect_answers: ["Pop &amp; Jazz", "Hip &amp; Hop", "R&amp;B"],
          },
        ],
      };

      (httpClient.get as Mock).mockResolvedValueOnce(mockApiResponse);

      const questions = await quizService.getQuiz(mockConfig);

      expect(questions[0].correctAnswer).toBe("Rock & Roll");
      expect(questions[0].options).toContain("Rock & Roll");
      expect(questions[0].options).toContain("Pop & Jazz");
    });

    it("generates unique IDs for each question", async () => {
      const mockApiResponse: ApiQuizResponse = {
        response_code: ApiResponseCode.SUCCESS,
        results: [
          {
            category: "Test",
            type: "multiple",
            difficulty: "easy",
            question: "Q1?",
            correct_answer: "A",
            incorrect_answers: ["B", "C", "D"],
          },
          {
            category: "Test",
            type: "multiple",
            difficulty: "easy",
            question: "Q2?",
            correct_answer: "X",
            incorrect_answers: ["Y", "Z", "W"],
          },
        ],
      };

      (httpClient.get as Mock).mockResolvedValueOnce(mockApiResponse);

      const questions = await quizService.getQuiz(mockConfig);

      expect(questions[0].id).not.toBe(questions[1].id);
    });

    it("shuffles options", async () => {
      // Run multiple times to statistically verify shuffling
      const originalOrder = ["1999", "2000", "1998", "2001"];
      let hasShuffled = false;

      for (let i = 0; i < 20; i++) {
        const mockApiResponse: ApiQuizResponse = {
          response_code: ApiResponseCode.SUCCESS,
          results: [
            {
              category: "Test",
              type: "multiple",
              difficulty: "easy",
              question: "Q?",
              correct_answer: "1999",
              incorrect_answers: ["2000", "1998", "2001"],
            },
          ],
        };

        (httpClient.get as Mock).mockResolvedValueOnce(mockApiResponse);
        const questions = await quizService.getQuiz(mockConfig);

        // Check if order is different from original
        if (
          questions[0].options.some(
            (opt, idx) => opt !== originalOrder[idx]
          )
        ) {
          hasShuffled = true;
          break;
        }
      }

      expect(hasShuffled).toBe(true);
    });
  });

  describe("getCategories", () => {
    it("returns categories from API", async () => {
      const mockCategories = {
        trivia_categories: [
          { id: 9, name: "General Knowledge" },
          { id: 10, name: "Entertainment: Books" },
          { id: 11, name: "Entertainment: Film" },
        ],
      };

      (httpClient.get as Mock).mockResolvedValueOnce(mockCategories);

      const categories = await quizService.getCategories();

      expect(categories).toHaveLength(3);
      expect(categories[0]).toEqual({ id: 9, name: "General Knowledge" });
    });
  });

  describe("validateResponse", () => {
    const mockConfig = {
      amount: 5,
      category: 11,
      difficulty: "medium" as const,
      type: "multiple" as const,
    };

    it("throws ValidationError on NO_RESULTS response code", async () => {
      (httpClient.get as Mock).mockResolvedValueOnce({
        response_code: ApiResponseCode.NO_RESULTS,
        results: [],
      });

      await expect(quizService.getQuiz(mockConfig)).rejects.toThrow(
        "Aucune question trouvée avec ces critères"
      );
    });

    it("throws ValidationError on INVALID_PARAMETER response code", async () => {
      (httpClient.get as Mock).mockResolvedValueOnce({
        response_code: ApiResponseCode.INVALID_PARAMETER,
        results: [],
      });

      await expect(quizService.getQuiz(mockConfig)).rejects.toThrow(
        "Paramètres invalides"
      );
    });

    it("throws ValidationError on TOKEN_NOT_FOUND response code", async () => {
      (httpClient.get as Mock).mockResolvedValueOnce({
        response_code: ApiResponseCode.TOKEN_NOT_FOUND,
        results: [],
      });

      await expect(quizService.getQuiz(mockConfig)).rejects.toThrow(
        "Session expirée"
      );
    });

    it("throws ValidationError on TOKEN_EMPTY response code", async () => {
      (httpClient.get as Mock).mockResolvedValueOnce({
        response_code: ApiResponseCode.TOKEN_EMPTY,
        results: [],
      });

      await expect(quizService.getQuiz(mockConfig)).rejects.toThrow(
        "Plus de questions disponibles"
      );
    });

    it("throws ValidationError on RATE_LIMIT response code", async () => {
      (httpClient.get as Mock).mockResolvedValueOnce({
        response_code: ApiResponseCode.RATE_LIMIT,
        results: [],
      });

      await expect(quizService.getQuiz(mockConfig)).rejects.toThrow(
        "Trop de requêtes, veuillez patienter"
      );
    });

    it("throws ValidationError on unknown response code", async () => {
      (httpClient.get as Mock).mockResolvedValueOnce({
        response_code: 99,
        results: [],
      });

      await expect(quizService.getQuiz(mockConfig)).rejects.toThrow(
        "Erreur API: code 99"
      );
    });

    it("throws ValidationError when results array is empty", async () => {
      (httpClient.get as Mock).mockResolvedValueOnce({
        response_code: ApiResponseCode.SUCCESS,
        results: [],
      });

      await expect(quizService.getQuiz(mockConfig)).rejects.toThrow(
        "Aucune question retournée par l'API"
      );
    });

    it("throws ValidationError when results is undefined", async () => {
      (httpClient.get as Mock).mockResolvedValueOnce({
        response_code: ApiResponseCode.SUCCESS,
        results: undefined,
      });

      await expect(quizService.getQuiz(mockConfig)).rejects.toThrow(
        "Aucune question retournée par l'API"
      );
    });
  });
});
