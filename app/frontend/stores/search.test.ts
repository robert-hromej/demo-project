import { describe, it, expect, beforeEach } from "vitest";
import {
  useSearchStore,
  selectSelectedIngredients,
  selectHasSelectedIngredients,
  selectSelectedIngredientsCount,
  selectSelectedIngredientIds,
  selectMatchPercentage,
  selectIncludeOptional,
  selectBudgetCents,
  selectServings,
  selectSearchMode,
  selectIsSearching,
  selectIngredientResults,
  selectBudgetResults,
} from "./search";
import type {
  Ingredient,
  RecipeWithIngredientMatch,
  RecipeWithBudgetInfo,
  PaginationMeta,
} from "@/types";

const mockIngredientMilk: Ingredient = {
  id: 1,
  name: "Milk",
  nameUk: "Молоко",
  unitPriceCents: 3500,
  unitPriceFormatted: "35.00 UAH",
  defaultUnit: "л",
  category: "Dairy",
  imageUrl: null,
};

const mockIngredientEggs: Ingredient = {
  id: 2,
  name: "Eggs",
  nameUk: "Яйця",
  unitPriceCents: 4500,
  unitPriceFormatted: "45.00 UAH",
  defaultUnit: "шт",
  category: "Dairy",
  imageUrl: null,
};

const mockIngredientFlour: Ingredient = {
  id: 3,
  name: "Flour",
  nameUk: "Борошно",
  unitPriceCents: 2000,
  unitPriceFormatted: "20.00 UAH",
  defaultUnit: "кг",
  category: "Grains",
  imageUrl: null,
};

const mockPaginationMeta: PaginationMeta = {
  currentPage: 1,
  totalPages: 3,
  totalCount: 25,
  perPage: 10,
};

const mockIngredientResult: RecipeWithIngredientMatch = {
  id: 1,
  title: "Pancakes",
  description: "Fluffy pancakes",
  prepTimeMin: 10,
  cookTimeMin: 15,
  totalTimeMin: 25,
  servings: 4,
  difficulty: "easy",
  imageUrl: null,
  estCostCents: 5000,
  estCostFormatted: "50.00 UAH",
  costPerServingFormatted: "12.50 UAH",
  avgRating: 4.5,
  ratingsCount: 12,
  category: null,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
  matchPercentage: 85,
  matchedIngredients: 3,
  totalIngredients: 4,
  missingIngredients: [mockIngredientFlour],
};

const mockBudgetResult: RecipeWithBudgetInfo = {
  id: 2,
  title: "Omelette",
  description: "Simple omelette",
  prepTimeMin: 5,
  cookTimeMin: 10,
  totalTimeMin: 15,
  servings: 2,
  difficulty: "easy",
  imageUrl: null,
  estCostCents: 3000,
  estCostFormatted: "30.00 UAH",
  costPerServingFormatted: "15.00 UAH",
  avgRating: 4.0,
  ratingsCount: 8,
  category: null,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
  actualCostCents: 2800,
  fitsBudget: true,
  remainingBudgetCents: 7200,
  budgetUsagePercentage: 28,
};

describe("useSearchStore", () => {
  beforeEach(() => {
    sessionStorage.clear();
    useSearchStore.getState().reset();
  });

  describe("initial state", () => {
    it("has correct default values", () => {
      const state = useSearchStore.getState();

      expect(state.searchMode).toBeNull();
      expect(state.isSearching).toBe(false);
      expect(state.selectedIngredients).toEqual([]);
      expect(state.matchPercentage).toBe(70);
      expect(state.includeOptional).toBe(false);
      expect(state.budgetCents).toBe(10000);
      expect(state.servings).toBe(4);
      expect(state.ingredientResults).toEqual([]);
      expect(state.ingredientResultsMeta).toBeNull();
      expect(state.budgetResults).toEqual([]);
      expect(state.budgetResultsMeta).toBeNull();
    });
  });

  describe("addIngredient", () => {
    it("adds an ingredient to selectedIngredients", () => {
      useSearchStore.getState().addIngredient(mockIngredientMilk);

      expect(useSearchStore.getState().selectedIngredients).toEqual([mockIngredientMilk]);
    });

    it("sets searchMode to 'ingredients'", () => {
      useSearchStore.getState().addIngredient(mockIngredientMilk);

      expect(useSearchStore.getState().searchMode).toBe("ingredients");
    });

    it("adds multiple ingredients", () => {
      useSearchStore.getState().addIngredient(mockIngredientMilk);
      useSearchStore.getState().addIngredient(mockIngredientEggs);

      expect(useSearchStore.getState().selectedIngredients).toEqual([
        mockIngredientMilk,
        mockIngredientEggs,
      ]);
    });

    it("does not add duplicate ingredients", () => {
      useSearchStore.getState().addIngredient(mockIngredientMilk);
      useSearchStore.getState().addIngredient(mockIngredientMilk);

      expect(useSearchStore.getState().selectedIngredients).toEqual([mockIngredientMilk]);
    });

    it("does not add ingredient with same id even if other fields differ", () => {
      useSearchStore.getState().addIngredient(mockIngredientMilk);
      useSearchStore.getState().addIngredient({ ...mockIngredientMilk, name: "Modified Milk" });

      expect(useSearchStore.getState().selectedIngredients).toHaveLength(1);
    });
  });

  describe("removeIngredient", () => {
    it("removes an ingredient by id", () => {
      useSearchStore.getState().addIngredient(mockIngredientMilk);
      useSearchStore.getState().addIngredient(mockIngredientEggs);

      useSearchStore.getState().removeIngredient(mockIngredientMilk.id);

      expect(useSearchStore.getState().selectedIngredients).toEqual([mockIngredientEggs]);
    });

    it("does nothing when removing non-existent id", () => {
      useSearchStore.getState().addIngredient(mockIngredientMilk);

      useSearchStore.getState().removeIngredient(999);

      expect(useSearchStore.getState().selectedIngredients).toEqual([mockIngredientMilk]);
    });

    it("results in empty array when removing the last ingredient", () => {
      useSearchStore.getState().addIngredient(mockIngredientMilk);
      useSearchStore.getState().removeIngredient(mockIngredientMilk.id);

      expect(useSearchStore.getState().selectedIngredients).toEqual([]);
    });
  });

  describe("clearIngredients", () => {
    it("clears selectedIngredients", () => {
      useSearchStore.getState().addIngredient(mockIngredientMilk);
      useSearchStore.getState().addIngredient(mockIngredientEggs);

      useSearchStore.getState().clearIngredients();

      expect(useSearchStore.getState().selectedIngredients).toEqual([]);
    });

    it("clears ingredient results", () => {
      useSearchStore.getState().setIngredientResults({
        results: [mockIngredientResult],
        meta: mockPaginationMeta,
      });

      useSearchStore.getState().clearIngredients();

      expect(useSearchStore.getState().ingredientResults).toEqual([]);
      expect(useSearchStore.getState().ingredientResultsMeta).toBeNull();
    });
  });

  describe("setMatchPercentage", () => {
    it("sets the match percentage", () => {
      useSearchStore.getState().setMatchPercentage(85);

      expect(useSearchStore.getState().matchPercentage).toBe(85);
    });

    it("clamps value to minimum 0", () => {
      useSearchStore.getState().setMatchPercentage(-10);

      expect(useSearchStore.getState().matchPercentage).toBe(0);
    });

    it("clamps value to maximum 100", () => {
      useSearchStore.getState().setMatchPercentage(150);

      expect(useSearchStore.getState().matchPercentage).toBe(100);
    });

    it("handles boundary value 0", () => {
      useSearchStore.getState().setMatchPercentage(0);

      expect(useSearchStore.getState().matchPercentage).toBe(0);
    });

    it("handles boundary value 100", () => {
      useSearchStore.getState().setMatchPercentage(100);

      expect(useSearchStore.getState().matchPercentage).toBe(100);
    });
  });

  describe("setIncludeOptional", () => {
    it("sets includeOptional to true", () => {
      useSearchStore.getState().setIncludeOptional(true);

      expect(useSearchStore.getState().includeOptional).toBe(true);
    });

    it("sets includeOptional to false", () => {
      useSearchStore.getState().setIncludeOptional(true);
      useSearchStore.getState().setIncludeOptional(false);

      expect(useSearchStore.getState().includeOptional).toBe(false);
    });
  });

  describe("setBudget", () => {
    it("sets budgetCents", () => {
      useSearchStore.getState().setBudget(25000);

      expect(useSearchStore.getState().budgetCents).toBe(25000);
    });

    it("sets searchMode to 'budget'", () => {
      useSearchStore.getState().setBudget(25000);

      expect(useSearchStore.getState().searchMode).toBe("budget");
    });

    it("ensures non-negative budget (clamps to 0)", () => {
      useSearchStore.getState().setBudget(-5000);

      expect(useSearchStore.getState().budgetCents).toBe(0);
    });

    it("accepts zero as a valid budget", () => {
      useSearchStore.getState().setBudget(0);

      expect(useSearchStore.getState().budgetCents).toBe(0);
    });
  });

  describe("setServings", () => {
    it("sets servings", () => {
      useSearchStore.getState().setServings(6);

      expect(useSearchStore.getState().servings).toBe(6);
    });

    it("ensures minimum of 1 serving", () => {
      useSearchStore.getState().setServings(0);

      expect(useSearchStore.getState().servings).toBe(1);
    });

    it("ensures minimum of 1 serving for negative values", () => {
      useSearchStore.getState().setServings(-3);

      expect(useSearchStore.getState().servings).toBe(1);
    });
  });

  describe("setIngredientResults", () => {
    it("sets ingredient results and meta", () => {
      useSearchStore.getState().setIngredientResults({
        results: [mockIngredientResult],
        meta: mockPaginationMeta,
      });

      const state = useSearchStore.getState();
      expect(state.ingredientResults).toEqual([mockIngredientResult]);
      expect(state.ingredientResultsMeta).toEqual(mockPaginationMeta);
    });

    it("sets isSearching to false", () => {
      useSearchStore.getState().setIsSearching(true);
      useSearchStore.getState().setIngredientResults({
        results: [mockIngredientResult],
        meta: mockPaginationMeta,
      });

      expect(useSearchStore.getState().isSearching).toBe(false);
    });

    it("handles empty results", () => {
      useSearchStore.getState().setIngredientResults({
        results: [],
        meta: { ...mockPaginationMeta, totalCount: 0, totalPages: 0 },
      });

      expect(useSearchStore.getState().ingredientResults).toEqual([]);
    });
  });

  describe("setBudgetResults", () => {
    it("sets budget results and meta", () => {
      useSearchStore.getState().setBudgetResults({
        results: [mockBudgetResult],
        meta: mockPaginationMeta,
      });

      const state = useSearchStore.getState();
      expect(state.budgetResults).toEqual([mockBudgetResult]);
      expect(state.budgetResultsMeta).toEqual(mockPaginationMeta);
    });

    it("sets isSearching to false", () => {
      useSearchStore.getState().setIsSearching(true);
      useSearchStore.getState().setBudgetResults({
        results: [mockBudgetResult],
        meta: mockPaginationMeta,
      });

      expect(useSearchStore.getState().isSearching).toBe(false);
    });
  });

  describe("clearResults", () => {
    it("clears all results and meta", () => {
      useSearchStore.getState().setIngredientResults({
        results: [mockIngredientResult],
        meta: mockPaginationMeta,
      });
      useSearchStore.getState().setBudgetResults({
        results: [mockBudgetResult],
        meta: mockPaginationMeta,
      });

      useSearchStore.getState().clearResults();

      const state = useSearchStore.getState();
      expect(state.ingredientResults).toEqual([]);
      expect(state.ingredientResultsMeta).toBeNull();
      expect(state.budgetResults).toEqual([]);
      expect(state.budgetResultsMeta).toBeNull();
    });
  });

  describe("setSearchMode", () => {
    it("sets search mode to 'ingredients'", () => {
      useSearchStore.getState().setSearchMode("ingredients");

      expect(useSearchStore.getState().searchMode).toBe("ingredients");
    });

    it("sets search mode to 'budget'", () => {
      useSearchStore.getState().setSearchMode("budget");

      expect(useSearchStore.getState().searchMode).toBe("budget");
    });

    it("sets search mode to null", () => {
      useSearchStore.getState().setSearchMode("ingredients");
      useSearchStore.getState().setSearchMode(null);

      expect(useSearchStore.getState().searchMode).toBeNull();
    });
  });

  describe("setIsSearching", () => {
    it("sets isSearching to true", () => {
      useSearchStore.getState().setIsSearching(true);

      expect(useSearchStore.getState().isSearching).toBe(true);
    });

    it("sets isSearching to false", () => {
      useSearchStore.getState().setIsSearching(true);
      useSearchStore.getState().setIsSearching(false);

      expect(useSearchStore.getState().isSearching).toBe(false);
    });
  });

  describe("reset", () => {
    it("resets all state to initial values", () => {
      // Modify everything
      useSearchStore.getState().addIngredient(mockIngredientMilk);
      useSearchStore.getState().setMatchPercentage(90);
      useSearchStore.getState().setIncludeOptional(true);
      useSearchStore.getState().setBudget(50000);
      useSearchStore.getState().setServings(8);
      useSearchStore.getState().setIsSearching(true);
      useSearchStore.getState().setIngredientResults({
        results: [mockIngredientResult],
        meta: mockPaginationMeta,
      });
      useSearchStore.getState().setBudgetResults({
        results: [mockBudgetResult],
        meta: mockPaginationMeta,
      });

      useSearchStore.getState().reset();

      const state = useSearchStore.getState();
      expect(state.searchMode).toBeNull();
      expect(state.isSearching).toBe(false);
      expect(state.selectedIngredients).toEqual([]);
      expect(state.matchPercentage).toBe(70);
      expect(state.includeOptional).toBe(false);
      expect(state.budgetCents).toBe(10000);
      expect(state.servings).toBe(4);
      expect(state.ingredientResults).toEqual([]);
      expect(state.ingredientResultsMeta).toBeNull();
      expect(state.budgetResults).toEqual([]);
      expect(state.budgetResultsMeta).toBeNull();
    });
  });

  describe("selectors", () => {
    it("selectSelectedIngredients returns selectedIngredients array", () => {
      useSearchStore.getState().addIngredient(mockIngredientMilk);

      expect(selectSelectedIngredients(useSearchStore.getState())).toEqual([mockIngredientMilk]);
    });

    it("selectSelectedIngredientIds returns array of ingredient ids", () => {
      useSearchStore.getState().addIngredient(mockIngredientMilk);
      useSearchStore.getState().addIngredient(mockIngredientEggs);

      expect(selectSelectedIngredientIds(useSearchStore.getState())).toEqual([1, 2]);
    });

    it("selectHasSelectedIngredients returns false when no ingredients selected", () => {
      expect(selectHasSelectedIngredients(useSearchStore.getState())).toBe(false);
    });

    it("selectHasSelectedIngredients returns true when ingredients are selected", () => {
      useSearchStore.getState().addIngredient(mockIngredientMilk);

      expect(selectHasSelectedIngredients(useSearchStore.getState())).toBe(true);
    });

    it("selectSelectedIngredientsCount returns 0 when no ingredients", () => {
      expect(selectSelectedIngredientsCount(useSearchStore.getState())).toBe(0);
    });

    it("selectSelectedIngredientsCount returns correct count", () => {
      useSearchStore.getState().addIngredient(mockIngredientMilk);
      useSearchStore.getState().addIngredient(mockIngredientEggs);
      useSearchStore.getState().addIngredient(mockIngredientFlour);

      expect(selectSelectedIngredientsCount(useSearchStore.getState())).toBe(3);
    });

    it("selectMatchPercentage returns the current match percentage", () => {
      useSearchStore.getState().setMatchPercentage(85);

      expect(selectMatchPercentage(useSearchStore.getState())).toBe(85);
    });

    it("selectIncludeOptional returns the current value", () => {
      useSearchStore.getState().setIncludeOptional(true);

      expect(selectIncludeOptional(useSearchStore.getState())).toBe(true);
    });

    it("selectBudgetCents returns the current budget", () => {
      useSearchStore.getState().setBudget(25000);

      expect(selectBudgetCents(useSearchStore.getState())).toBe(25000);
    });

    it("selectServings returns the current servings", () => {
      useSearchStore.getState().setServings(6);

      expect(selectServings(useSearchStore.getState())).toBe(6);
    });

    it("selectSearchMode returns the current search mode", () => {
      useSearchStore.getState().setSearchMode("budget");

      expect(selectSearchMode(useSearchStore.getState())).toBe("budget");
    });

    it("selectIsSearching returns the current searching state", () => {
      useSearchStore.getState().setIsSearching(true);

      expect(selectIsSearching(useSearchStore.getState())).toBe(true);
    });

    it("selectIngredientResults returns ingredient results", () => {
      useSearchStore.getState().setIngredientResults({
        results: [mockIngredientResult],
        meta: mockPaginationMeta,
      });

      expect(selectIngredientResults(useSearchStore.getState())).toEqual([mockIngredientResult]);
    });

    it("selectBudgetResults returns budget results", () => {
      useSearchStore.getState().setBudgetResults({
        results: [mockBudgetResult],
        meta: mockPaginationMeta,
      });

      expect(selectBudgetResults(useSearchStore.getState())).toEqual([mockBudgetResult]);
    });
  });
});
