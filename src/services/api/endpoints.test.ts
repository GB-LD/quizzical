import { describe, it, expect } from "vitest";
import { ENDPOINTS } from "./endpoints";

describe("ENDPOINTS", () => {
  describe("quiz", () => {
    it("generates URL with default parameters", () => {
      const url = ENDPOINTS.quiz();

      // Test simple
      expect(url).toBe(
        "https://opentdb.com/api.php?amount=10&category=11"
      );
    });

    it("generates URL with custom amount and category", () => {
      const url = ENDPOINTS.quiz(5, 21);

      expect(url).toContain("amount=5");
      expect(url).toContain("category=21");
    });

    it("includes difficulty when provided", () => {
      const url = ENDPOINTS.quiz(10, 11, "hard");

      expect(url).toContain("difficulty=hard");
    });

    it("includes type when provided", () => {
      const url = ENDPOINTS.quiz(10, 11, undefined, "boolean");

      expect(url).toContain("type=boolean");
    });

    it("includes both difficulty and type when provided", () => {
      const url = ENDPOINTS.quiz(15, 9, "medium", "multiple");

      expect(url).toContain("amount=15");
      expect(url).toContain("category=9");
      expect(url).toContain("difficulty=medium");
      expect(url).toContain("type=multiple");
    });

    it("omits difficulty when undefined", () => {
      const url = ENDPOINTS.quiz(10, 11, undefined, "multiple");

      expect(url).not.toContain("difficulty=");
    });

    it("omits type when undefined", () => {
      const url = ENDPOINTS.quiz(10, 11, "easy");

      expect(url).not.toContain("type=");
    });
  });

  describe("categories", () => {
    it("returns the correct categories endpoint", () => {
      expect(ENDPOINTS.categories).toBe(
        "https://opentdb.com/api_category.php"
      );
    });
  });
});
