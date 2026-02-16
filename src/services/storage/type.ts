export interface StorageStrategy<T> {
  get(key: string): T | null;
  set(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

export interface StorageEntry<T> {
  data: T;
  savedAt: number;
  version?: number;
}

export const STORAGE_KEYS = {
  QUIZ_QUESTIONS: "quizzical_question",
  QUIZ_CONFIG: "quizzical_config",
  QUIZ_ANSWERS: "quizzical_answers",
  QUIZ_USER_ANSWERS: "quizzical_user_answers",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
