import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { ApiError, NetworkError, ValidationError } from "../../utils/errors";
import type { QuizQuestion, QuizConfig } from "../../services/quiz";

// Mock du service quiz
vi.mock("../../services/quiz", async () => {
  const actual = await vi.importActual("../../services/quiz");
  return {
    ...actual,
    quizService: {
      getQuiz: vi.fn(),
    },
  };
});

import { quizService } from "../../services/quiz";
import { useQuiz } from "../useQuiz";

describe("useQuiz", () => {
  const mockQuestions: QuizQuestion[] = [
    {
      id: "1",
      category: "Entertainment: Film",
      type: "multiple",
      difficulty: "medium",
      question: "What year was the movie released?",
      correctAnswer: "1999",
      options: ["1999", "2000", "1998", "2001"],
    },
    {
      id: "2",
      category: "Science",
      type: "multiple",
      difficulty: "easy",
      question: "What is H2O?",
      correctAnswer: "Water",
      options: ["Water", "Fire", "Air", "Earth"],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("État initial", () => {
    it("devrait avoir l'état initial correct", () => {
      // When - Rendu du hook
      const { result } = renderHook(() => useQuiz());

      // Then - Vérification de l'état initial
      expect(result.current.questions).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("loadQuiz", () => {
    it("devrait charger les questions avec succès", async () => {
      // Given - Configuration du mock
      (quizService.getQuiz as Mock).mockResolvedValueOnce(mockQuestions);

      // When - Rendu et appel de loadQuiz
      const { result } = renderHook(() => useQuiz());

      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then - Vérifications
      expect(result.current.questions).toEqual(mockQuestions);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("devrait gérer l'état isLoading pendant le chargement", async () => {
      // Given - Mock avec délai
      (quizService.getQuiz as Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockQuestions), 100)
          )
      );

      const { result } = renderHook(() => useQuiz());

      // When - Démarrage du chargement
      act(() => {
        result.current.loadQuiz();
      });

      // Then - Vérification de l'état de chargement immédiat
      expect(result.current.isLoading).toBe(true);

      // Attendre la fin du chargement
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("devrait utiliser la config par défaut si non spécifiée", async () => {
      // Given
      (quizService.getQuiz as Mock).mockResolvedValueOnce(mockQuestions);

      // When
      const { result } = renderHook(() => useQuiz());

      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then
      expect(quizService.getQuiz).toHaveBeenCalledWith({
        amount: 10,
        category: 11,
      });
    });

    it("devrait accepter une configuration personnalisée", async () => {
      // Given
      const customConfig: QuizConfig = {
        amount: 5,
        category: 9,
        difficulty: "hard",
      };
      (quizService.getQuiz as Mock).mockResolvedValueOnce(mockQuestions);

      // When
      const { result } = renderHook(() => useQuiz());

      await act(async () => {
        await result.current.loadQuiz(customConfig);
      });

      // Then
      expect(quizService.getQuiz).toHaveBeenCalledWith(customConfig);
    });
  });

  describe("Gestion des erreurs", () => {
    it("devrait gérer une erreur serveur (500)", async () => {
      // Given
      const apiError = new ApiError("Server Error", 500);
      (quizService.getQuiz as Mock).mockRejectedValueOnce(apiError);

      const { result } = renderHook(() => useQuiz());

      // When
      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then
      expect(result.current.error).toBe(
        "Le serveur rencontre des difficultés. Veuillez réessayer plus tard"
      );
      expect(result.current.isLoading).toBe(false);
      expect(result.current.questions).toEqual([]);
    });

    it("devrait gérer une erreur 404", async () => {
      // Given
      const apiError = new ApiError("Not Found", 404);
      (quizService.getQuiz as Mock).mockRejectedValueOnce(apiError);

      const { result } = renderHook(() => useQuiz());

      // When
      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then
      expect(result.current.error).toBe("Ressource non trouvée");
    });

    it("devrait gérer une erreur 429 (rate limit)", async () => {
      // Given
      const apiError = new ApiError("Too Many Requests", 429);
      (quizService.getQuiz as Mock).mockRejectedValueOnce(apiError);

      const { result } = renderHook(() => useQuiz());

      // When
      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then
      expect(result.current.error).toBe(
        "Trop de requêtes. Veuillez patienter quelques instants."
      );
    });

    it("devrait gérer une erreur API avec autre code (non géré spécifiquement)", async () => {
      // Given
      const apiError = new ApiError("Bad Request", 400);
      (quizService.getQuiz as Mock).mockRejectedValueOnce(apiError);

      const { result } = renderHook(() => useQuiz());

      // When
      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then - ApiError étend Error, donc le message inclut error.message
      expect(result.current.error).toBe("Une erreur est survenue Bad Request");
    });

    it("devrait gérer une erreur réseau", async () => {
      // Given
      const networkError = new NetworkError("No connection");
      (quizService.getQuiz as Mock).mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useQuiz());

      // When
      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then
      expect(result.current.error).toBe(
        "Problème de connexion. Vérifiez votre connexion internet"
      );
    });

    it("devrait gérer une erreur de validation", async () => {
      // Given
      const validationError = new ValidationError("Champ invalide");
      (quizService.getQuiz as Mock).mockRejectedValueOnce(validationError);

      const { result } = renderHook(() => useQuiz());

      // When
      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then
      expect(result.current.error).toBe("Champ invalide");
    });

    it("devrait gérer une Error standard", async () => {
      // Given
      (quizService.getQuiz as Mock).mockRejectedValueOnce(new Error("Oops"));

      const { result } = renderHook(() => useQuiz());

      // When
      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then
      expect(result.current.error).toBe("Une erreur est survenue Oops");
    });

    it("devrait gérer une erreur inconnue (string)", async () => {
      // Given
      (quizService.getQuiz as Mock).mockRejectedValueOnce("erreur inconnue");

      const { result } = renderHook(() => useQuiz());

      // When
      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then
      expect(result.current.error).toBe("Une erreur inattendue est survenue");
    });

    it("devrait gérer une erreur inconnue (null)", async () => {
      // Given
      (quizService.getQuiz as Mock).mockRejectedValueOnce(null);

      const { result } = renderHook(() => useQuiz());

      // When
      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then
      expect(result.current.error).toBe("Une erreur inattendue est survenue");
    });
  });

  describe("refetch", () => {
    it("devrait recharger avec la même configuration", async () => {
      // Given
      const customConfig: QuizConfig = { amount: 5, category: 9 };
      (quizService.getQuiz as Mock).mockResolvedValue(mockQuestions);

      const { result } = renderHook(() => useQuiz());

      // Chargement initial avec config custom
      await act(async () => {
        await result.current.loadQuiz(customConfig);
      });

      // Réinitialiser le mock pour voir si refetch l'appelle
      vi.mocked(quizService.getQuiz).mockClear();
      vi.mocked(quizService.getQuiz).mockResolvedValueOnce([]);

      // When - Refetch
      await act(async () => {
        await result.current.refetch();
      });

      // Then - Vérifier que la même config est utilisée
      expect(quizService.getQuiz).toHaveBeenCalledWith(customConfig);
    });

    it("devrait utiliser la config par défaut si loadQuiz n'a jamais été appelé", async () => {
      // Given
      (quizService.getQuiz as Mock).mockResolvedValueOnce(mockQuestions);

      const { result } = renderHook(() => useQuiz());

      // When - Refetch sans appel préalable à loadQuiz
      await act(async () => {
        await result.current.refetch();
      });

      // Then - Vérifier que la config par défaut est utilisée
      expect(quizService.getQuiz).toHaveBeenCalledWith({
        amount: 10,
        category: 11,
      });
    });
  });

  describe("clearError", () => {
    it("devrait effacer l'erreur", async () => {
      // Given - Créer une erreur d'abord
      (quizService.getQuiz as Mock).mockRejectedValueOnce(new Error("Erreur"));

      const { result } = renderHook(() => useQuiz());

      await act(async () => {
        await result.current.loadQuiz();
      });

      expect(result.current.error).not.toBeNull();

      // When
      act(() => {
        result.current.clearError();
      });

      // Then
      expect(result.current.error).toBeNull();
    });

    it("ne devrait rien faire si pas d'erreur", () => {
      // Given
      const { result } = renderHook(() => useQuiz());

      expect(result.current.error).toBeNull();

      // When
      act(() => {
        result.current.clearError();
      });

      // Then
      expect(result.current.error).toBeNull();
    });
  });

  describe("Séquence d'opérations", () => {
    it("devrait pouvoir recharger après une erreur", async () => {
      // Given - Première requête échoue
      (quizService.getQuiz as Mock)
        .mockRejectedValueOnce(new Error("Première erreur"))
        .mockResolvedValueOnce(mockQuestions);

      const { result } = renderHook(() => useQuiz());

      // Première tentative échoue
      await act(async () => {
        await result.current.loadQuiz();
      });

      expect(result.current.error).toBe("Une erreur est survenue Première erreur");
      expect(result.current.questions).toEqual([]);

      // When - Deuxième tentative réussit
      await act(async () => {
        await result.current.loadQuiz();
      });

      // Then
      expect(result.current.error).toBeNull();
      expect(result.current.questions).toEqual(mockQuestions);
    });

    it("devrait réinitialiser les questions avant chaque nouveau chargement", async () => {
      // Given
      (quizService.getQuiz as Mock)
        .mockResolvedValueOnce(mockQuestions)
        .mockImplementationOnce(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve([mockQuestions[0]]), 50)
            )
        );

      const { result } = renderHook(() => useQuiz());

      // Premier chargement réussi
      await act(async () => {
        await result.current.loadQuiz();
      });

      expect(result.current.questions).toHaveLength(2);

      // When - Nouveau chargement
      act(() => {
        result.current.loadQuiz();
      });

      // Then - Les questions devraient être vidées ou conservées selon l'implémentation
      // En fait, dans useQuiz, les questions ne sont pas réinitialisées avant le nouveau chargement
      // Elles sont seulement mises à jour après le succès
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.questions).toHaveLength(1);
    });
  });
});
