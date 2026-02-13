import type { QuizState, QuizAction } from "./types";

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "LOAD_START":
      return {
        ...state,
        status: "loading",
        error: null,
        lastConfig: action.config,
      };
    case "LOAD_SUCCESS":
      return {
        ...state,
        status: "success",
        questions: action.questions,
        hasCachedQuiz: true,
        error: null,
      };
    case "LOAD_ERROR":
      return {
        ...state,
        status: "error",
        questions: [],
        error: action.message,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
        status: state.questions.length ? "success" : "idle",
      };
    case "CLEAR_CACHE":
      return {
        ...state,
        questions: [],
        userAnswers: {},
        hasCachedQuiz: false,
        status: "idle",
        error: null,
      };
    case "CHANGE_SCREEN":
      return {
        ...state,
        currentScreen: action.screen,
      };
    case "SELECT_ANSWER":
      return {
        ...state,
        userAnswers: {
          ...state.userAnswers,
          [action.questionId]: action.answerId,
        },
      };
    default:
      return state;
  }
}
