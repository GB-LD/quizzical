const BASE_URL = "https://opentdb.com";

export const ENDPOINTS = {
  quiz: (
    amount: number = 10,
    category: number = 11,
    difficulty?: "easy" | "medium" | "hard",
    type?: "multiple" | "boolean",
  ): string => {
    const params = new URLSearchParams();
    params.append("amount", amount.toString());
    params.append("category", category.toString());

    if (difficulty) params.append("difficulty", difficulty.toString());
    if (type) params.append("type", type.toString());

    return `${BASE_URL}/api.php?${params.toString()}`;
  },
  categories: `${BASE_URL}/api_category.php`,
};
