import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  SessionStorageStrategy,
  StorageService,
  quizStorage,
  quizConfigStorage,
} from "../StorageService";
import type { StorageStrategy } from "../type";
import type { QuizQuestion } from "../../quiz/types";

// Mock console.warn to avoid noise in tests
const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

describe("SessionStorageStrategy", () => {
  let strategy: SessionStorageStrategy<string>;
  const TEST_KEY = "test-key";

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mocked sessionStorage
    strategy = new SessionStorageStrategy<string>();
  });

  describe("get", () => {
    it("should return null when no data is present", () => {
      // Given
      const mockGetItem = vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);

      // When
      const result = strategy.get(TEST_KEY);

      // Then
      expect(result).toBeNull();
      expect(mockGetItem).toHaveBeenCalledWith(TEST_KEY);
    });

    it("should return data when a valid entry exists", () => {
      // Given
      const mockData = { data: "test-value", savedAt: Date.now(), version: 1 };
      vi.spyOn(Storage.prototype, "getItem").mockReturnValue(JSON.stringify(mockData));

      // When
      const result = strategy.get(TEST_KEY);

      // Then
      expect(result).toBe("test-value");
    });

    it("should return null when JSON is invalid", () => {
      // Given
      vi.spyOn(Storage.prototype, "getItem").mockReturnValue("invalid-json");

      // When
      const result = strategy.get(TEST_KEY);

      // Then
      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        `[Storage] Failed to get ${TEST_KEY}:`,
        expect.any(SyntaxError)
      );
    });

    it("should return null on sessionStorage error", () => {
      // Given
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("Storage error");
      });

      // When
      const result = strategy.get(TEST_KEY);

      // Then
      expect(result).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        `[Storage] Failed to get ${TEST_KEY}:`,
        expect.any(Error)
      );
    });
  });

  describe("set", () => {
    it("should save data with correct metadata", () => {
      // Given
      const mockSetItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {});
      const value = "test-value";
      const beforeSet = Date.now();

      // When
      strategy.set(TEST_KEY, value);

      // Then
      expect(mockSetItem).toHaveBeenCalledTimes(1);
      const savedEntry = JSON.parse(mockSetItem.mock.calls[0][1]);
      expect(savedEntry.data).toBe(value);
      expect(savedEntry.version).toBe(1);
      expect(savedEntry.savedAt).toBeGreaterThanOrEqual(beforeSet);
      expect(savedEntry.savedAt).toBeLessThanOrEqual(Date.now());
    });

    it("should handle QuotaExceededError", () => {
      // Given
      const quotaError = new Error("Quota exceeded");
      quotaError.name = "QuotaExceededError";
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw quotaError;
      });

      // When
      strategy.set(TEST_KEY, "value");

      // Then
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        `[Storage] Failed to set ${TEST_KEY}:`,
        quotaError
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "[Storage] Quota exceeded, skipping persistence"
      );
    });

    it("should handle generic save errors", () => {
      // Given
      const genericError = new Error("Generic error");
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw genericError;
      });

      // When
      strategy.set(TEST_KEY, "value");

      // Then
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        `[Storage] Failed to set ${TEST_KEY}:`,
        genericError
      );
    });
  });

  describe("remove", () => {
    it("should remove entry from storage", () => {
      // Given
      const mockRemoveItem = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {});

      // When
      strategy.remove(TEST_KEY);

      // Then
      expect(mockRemoveItem).toHaveBeenCalledWith(TEST_KEY);
    });

    it("should handle removal errors", () => {
      // Given
      vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
        throw new Error("Remove error");
      });

      // When
      strategy.remove(TEST_KEY);

      // Then
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        `[Storage] Failed to remove ${TEST_KEY}:`,
        expect.any(Error)
      );
    });
  });

  describe("clear", () => {
    it("should clear all storage", () => {
      // Given
      const mockClear = vi.spyOn(Storage.prototype, "clear").mockImplementation(() => {});

      // When
      strategy.clear();

      // Then
      expect(mockClear).toHaveBeenCalledTimes(1);
    });

    it("should handle clear errors", () => {
      // Given
      vi.spyOn(Storage.prototype, "clear").mockImplementation(() => {
        throw new Error("Clear error");
      });

      // When
      strategy.clear();

      // Then
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "[Storage] Failed to clear:",
        expect.any(Error)
      );
    });
  });
});

describe("StorageService", () => {
  const TEST_KEY = "test-service-key";
  let mockStrategy: StorageStrategy<string>;
  let service: StorageService<string>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStrategy = {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    };
    service = new StorageService<string>(TEST_KEY, mockStrategy);
  });

  describe("constructor", () => {
    it("should use SessionStorageStrategy as default when no strategy is provided", () => {
      // Given & When
      const defaultService = new StorageService<string>(TEST_KEY);

      // Then - Verify that the default strategy is used
      // by testing that get() calls the strategy
      vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
      defaultService.get();
      expect(Storage.prototype.getItem).toHaveBeenCalledWith(TEST_KEY);
    });
  });

  describe("get", () => {
    it("should delegate to strategy with correct key", () => {
      // Given
      const expectedValue = "retrieved-value";
      vi.mocked(mockStrategy.get).mockReturnValue(expectedValue);

      // When
      const result = service.get();

      // Then
      expect(mockStrategy.get).toHaveBeenCalledWith(TEST_KEY);
      expect(result).toBe(expectedValue);
    });

    it("should return null when strategy returns null", () => {
      // Given
      vi.mocked(mockStrategy.get).mockReturnValue(null);

      // When
      const result = service.get();

      // Then
      expect(result).toBeNull();
    });
  });

  describe("save", () => {
    it("should delegate to strategy with correct key and value", () => {
      // Given
      const valueToSave = "value-to-save";

      // When
      service.save(valueToSave);

      // Then
      expect(mockStrategy.set).toHaveBeenCalledWith(TEST_KEY, valueToSave);
    });
  });

  describe("remove", () => {
    it("should delegate to strategy with correct key", () => {
      // When
      service.remove();

      // Then
      expect(mockStrategy.remove).toHaveBeenCalledWith(TEST_KEY);
    });
  });

  describe("hasData", () => {
    it("should return true when data exists", () => {
      // Given
      vi.mocked(mockStrategy.get).mockReturnValue("existing-data");

      // When
      const result = service.hasData();

      // Then
      expect(result).toBe(true);
    });

    it("should return false when no data exists", () => {
      // Given
      vi.mocked(mockStrategy.get).mockReturnValue(null);

      // When
      const result = service.hasData();

      // Then
      expect(result).toBe(false);
    });

    it("should call get() to check data existence", () => {
      // Given
      vi.mocked(mockStrategy.get).mockReturnValue(null);

      // When
      service.hasData();

      // Then
      expect(mockStrategy.get).toHaveBeenCalledWith(TEST_KEY);
    });
  });
});

describe("Exported instances", () => {
  it("quizStorage should be configured with QUIZ_QUESTIONS key", () => {
    // Given
    const mockData: Partial<QuizQuestion>[] = [{ id: "1", question: "Test?" }];
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue(
      JSON.stringify({ data: mockData, savedAt: Date.now(), version: 1 })
    );

    // When
    const result = quizStorage.get();

    // Then
    expect(result).toEqual(mockData);
  });

  it("quizConfigStorage should be configured with QUIZ_CONFIG key", () => {
    // Given
    const mockConfig = { amount: 10, category: 11 };
    vi.spyOn(Storage.prototype, "getItem").mockReturnValue(
      JSON.stringify({ data: mockConfig, savedAt: Date.now(), version: 1 })
    );

    // When
    const result = quizConfigStorage.get();

    // Then
    expect(result).toEqual(mockConfig);
  });
});
