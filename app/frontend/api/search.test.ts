import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchByIngredients, searchByBudget, searchApi } from "./search";

const mockPost = vi.fn();

vi.mock("./client", () => ({
  apiClient: {
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

describe("search API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("searchByIngredients", () => {
    const requestData = {
      ingredientIds: [1, 2, 3],
      matchPercentage: 80,
    };

    const mockResponse = {
      data: [
        {
          id: 1,
          title: "Tomato Soup",
          matchPercentage: 100,
          matchedIngredients: 2,
          totalIngredients: 2,
          missingIngredients: [],
        },
      ],
      meta: { currentPage: 1, totalPages: 1, totalCount: 1, perPage: 20 },
    };

    it("calls apiClient.post with correct endpoint and data", async () => {
      mockPost.mockResolvedValue(mockResponse);

      await searchByIngredients(requestData);

      expect(mockPost).toHaveBeenCalledWith("/search/by-ingredients", requestData);
    });

    it("returns search results", async () => {
      mockPost.mockResolvedValue(mockResponse);

      const result = await searchByIngredients(requestData);

      expect(result).toEqual(mockResponse);
    });

    it("passes optional filters", async () => {
      mockPost.mockResolvedValue(mockResponse);
      const dataWithFilters = {
        ...requestData,
        categoryId: 5,
        maxCost: 3000,
        includeOptional: true,
      };

      await searchByIngredients(dataWithFilters);

      expect(mockPost).toHaveBeenCalledWith("/search/by-ingredients", dataWithFilters);
    });

    it("propagates API errors", async () => {
      mockPost.mockRejectedValue(new Error("Validation error"));

      await expect(searchByIngredients(requestData)).rejects.toThrow("Validation error");
    });
  });

  describe("searchByBudget", () => {
    const requestData = { budgetCents: 5000 };

    const mockResponse = {
      data: [
        {
          id: 1,
          title: "Budget Meal",
          fitsBudget: true,
          remainingBudgetCents: 3000,
          budgetUsagePercentage: 40,
        },
      ],
      meta: { currentPage: 1, totalPages: 1, totalCount: 1, perPage: 20 },
    };

    it("calls apiClient.post with correct endpoint and data", async () => {
      mockPost.mockResolvedValue(mockResponse);

      await searchByBudget(requestData);

      expect(mockPost).toHaveBeenCalledWith("/search/by-budget", requestData);
    });

    it("returns search results", async () => {
      mockPost.mockResolvedValue(mockResponse);

      const result = await searchByBudget(requestData);

      expect(result).toEqual(mockResponse);
    });

    it("passes optional params", async () => {
      mockPost.mockResolvedValue(mockResponse);
      const dataWithParams = { ...requestData, servings: 4, categoryId: 2 };

      await searchByBudget(dataWithParams);

      expect(mockPost).toHaveBeenCalledWith("/search/by-budget", dataWithParams);
    });
  });

  describe("searchApi object", () => {
    it("exports all API functions", () => {
      expect(searchApi.byIngredients).toBe(searchByIngredients);
      expect(searchApi.byBudget).toBe(searchByBudget);
    });
  });
});
