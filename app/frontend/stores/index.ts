// Stores barrel export
export {
  useAuthStore,
  selectUser,
  selectToken,
  selectIsAuthenticated,
  selectIsLoading,
} from "./auth";

export {
  useSearchStore,
  selectSelectedIngredients,
  selectSelectedIngredientIds,
  selectMatchPercentage,
  selectIncludeOptional,
  selectBudgetCents,
  selectServings,
  selectSearchMode,
  selectIsSearching,
  selectIngredientResults,
  selectBudgetResults,
  selectHasSelectedIngredients,
  selectSelectedIngredientsCount,
} from "./search";

// Re-export types
export type { User } from "./auth";
export type {
  Ingredient,
  RecipeWithIngredientMatch,
  RecipeWithBudgetInfo,
} from "./search";
