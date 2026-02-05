import type { QuizConfig, QuizQuestion } from "../quiz";
import { type StorageStrategy, type StorageEntry, STORAGE_KEYS } from "./type";

export class SessionStorageStrategy<T> implements StorageStrategy<T> {
  get(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key);
      if (!item) return null;

      const entry: StorageEntry<T> = JSON.parse(item);
      return entry.data;
    } catch (error) {
      console.warn(`[Storage] Failed to get ${key}:`, error);
      return null;
    }
  }

  set(key: string, value: T): void {
    try {
      const entry: StorageEntry<T> = {
        data: value,
        savedAt: Date.now(),
        version: 1,
      };
      sessionStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.warn(`[Storage] Failed to set ${key}:`, error);
      if (error instanceof Error && error.name === "QuotaExceededError") {
        console.warn("[Storage] Quota exceeded, skipping persistence");
      }
    }
  }

  remove(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(`[Storage] Failed to remove ${key}:`, error);
    }
  }

  clear(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn(`[Storage] Failed to clear:`, error);
    }
  }
}

export class StorageService<T> {
  private key: string;
  private strategy: StorageStrategy<T>;

  constructor(
    key: string,
    strategy: StorageStrategy<T> = new SessionStorageStrategy<T>(),
  ) {
    this.key = key;
    this.strategy = strategy;
  }

  get(): T | null {
    return this.strategy.get(this.key);
  }

  save(value: T): void {
    this.strategy.set(this.key, value);
  }

  remove(): void {
    this.strategy.remove(this.key);
  }

  hasData(): boolean {
    return this.get() !== null;
  }
}

export const quizStorage = new StorageService<QuizQuestion[]>(
  STORAGE_KEYS.QUIZ_QUESTIONS,
);

export const quizConfigStorage = new StorageService<QuizConfig>(
  STORAGE_KEYS.QUIZ_CONFIG,
);
