import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Ingredient,
  RecipeWithIngredientMatch,
  RecipeWithBudgetInfo,
  PaginationMeta,
} from "@/types";

// Search mode types
type SearchMode = "ingredients" | "budget" | null;

interface IngredientSearchState {
  selectedIngredients: Ingredient[];
  matchPercentage: number;
  includeOptional: boolean;
}

interface BudgetSearchState {
  budgetCents: number;
  servings: number;
}

interface SearchResults {
  ingredientResults: RecipeWithIngredientMatch[];
  ingredientResultsMeta: PaginationMeta | null;
  budgetResults: RecipeWithBudgetInfo[];
  budgetResultsMeta: PaginationMeta | null;
}

interface SearchState extends IngredientSearchState, BudgetSearchState, SearchResults {
  // Current search mode
  searchMode: SearchMode;
  isSearching: boolean;

  // Ingredient search actions
  addIngredient: (ingredient: Ingredient) => void;
  removeIngredient: (ingredientId: number) => void;
  clearIngredients: () => void;
  setMatchPercentage: (percentage: number) => void;
  setIncludeOptional: (include: boolean) => void;

  // Budget search actions
  setBudget: (budgetCents: number) => void;
  setServings: (servings: number) => void;

  // Results actions
  setIngredientResults: (params: {
    results: RecipeWithIngredientMatch[];
    meta: PaginationMeta;
  }) => void;
  setBudgetResults: (params: {
    results: RecipeWithBudgetInfo[];
    meta: PaginationMeta;
  }) => void;
  clearResults: () => void;

  // General actions
  setSearchMode: (mode: SearchMode) => void;
  setIsSearching: (isSearching: boolean) => void;
  reset: () => void;
}

const initialState = {
  // Search mode
  searchMode: null as SearchMode,
  isSearching: false,

  // Ingredient search state
  selectedIngredients: [] as Ingredient[],
  matchPercentage: 70,
  includeOptional: false,

  // Budget search state
  budgetCents: 10000, // Default $100.00
  servings: 4,

  // Results
  ingredientResults: [] as RecipeWithIngredientMatch[],
  ingredientResultsMeta: null as PaginationMeta | null,
  budgetResults: [] as RecipeWithBudgetInfo[],
  budgetResultsMeta: null as PaginationMeta | null,
};

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Ingredient search actions
      addIngredient: (ingredient) => {
        const { selectedIngredients } = get();

        // Don't add duplicates
        if (selectedIngredients.some((i) => i.id === ingredient.id)) {
          return;
        }

        set({
          selectedIngredients: [...selectedIngredients, ingredient],
          searchMode: "ingredients",
        });
      },

      removeIngredient: (ingredientId) => {
        const { selectedIngredients } = get();

        set({
          selectedIngredients: selectedIngredients.filter(
            (i) => i.id !== ingredientId
          ),
        });
      },

      clearIngredients: () => {
        set({
          selectedIngredients: [],
          ingredientResults: [],
          ingredientResultsMeta: null,
        });
      },

      setMatchPercentage: (percentage) => {
        // Clamp between 0 and 100
        const clamped = Math.max(0, Math.min(100, percentage));
        set({ matchPercentage: clamped });
      },

      setIncludeOptional: (include) => {
        set({ includeOptional: include });
      },

      // Budget search actions
      setBudget: (budgetCents) => {
        // Ensure non-negative
        const validBudget = Math.max(0, budgetCents);
        set({
          budgetCents: validBudget,
          searchMode: "budget",
        });
      },

      setServings: (servings) => {
        // Ensure at least 1 serving
        const validServings = Math.max(1, servings);
        set({ servings: validServings });
      },

      // Results actions
      setIngredientResults: ({ results, meta }) => {
        set({
          ingredientResults: results,
          ingredientResultsMeta: meta,
          isSearching: false,
        });
      },

      setBudgetResults: ({ results, meta }) => {
        set({
          budgetResults: results,
          budgetResultsMeta: meta,
          isSearching: false,
        });
      },

      clearResults: () => {
        set({
          ingredientResults: [],
          ingredientResultsMeta: null,
          budgetResults: [],
          budgetResultsMeta: null,
        });
      },

      // General actions
      setSearchMode: (mode) => {
        set({ searchMode: mode });
      },

      setIsSearching: (isSearching) => {
        set({ isSearching });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "search-storage",
      storage: createJSONStorage(() => sessionStorage),
      // Persist selected ingredients and search params, but not results
      partialize: (state) => ({
        selectedIngredients: state.selectedIngredients,
        matchPercentage: state.matchPercentage,
        includeOptional: state.includeOptional,
        budgetCents: state.budgetCents,
        servings: state.servings,
        searchMode: state.searchMode,
      }),
    }
  )
);

// Selectors
export const selectSelectedIngredients = (state: SearchState) =>
  state.selectedIngredients;
export const selectSelectedIngredientIds = (state: SearchState) =>
  state.selectedIngredients.map((i) => i.id);
export const selectMatchPercentage = (state: SearchState) =>
  state.matchPercentage;
export const selectIncludeOptional = (state: SearchState) =>
  state.includeOptional;
export const selectBudgetCents = (state: SearchState) => state.budgetCents;
export const selectServings = (state: SearchState) => state.servings;
export const selectSearchMode = (state: SearchState) => state.searchMode;
export const selectIsSearching = (state: SearchState) => state.isSearching;
export const selectIngredientResults = (state: SearchState) =>
  state.ingredientResults;
export const selectBudgetResults = (state: SearchState) => state.budgetResults;

// Computed selectors
export const selectHasSelectedIngredients = (state: SearchState) =>
  state.selectedIngredients.length > 0;
export const selectSelectedIngredientsCount = (state: SearchState) =>
  state.selectedIngredients.length;

// Re-export types for convenience
export type { Ingredient, RecipeWithIngredientMatch, RecipeWithBudgetInfo };
