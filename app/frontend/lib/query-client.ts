import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import type { ApiError } from "@/types";

// Default configuration for queries
const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const DEFAULT_GC_TIME = 30 * 60 * 1000; // 30 minutes (formerly cacheTime)

// Global error handler for queries
function handleQueryError(error: unknown): void {
  const apiError = error as ApiError;

  if (apiError.status === 401) {
    // Handle unauthorized - could dispatch to auth store
    console.error("Unauthorized request - please login again");
    // Could trigger logout or redirect to login
  } else if (apiError.status === 403) {
    console.error("Forbidden - you do not have permission for this action");
  } else if (apiError.status === 404) {
    console.error("Resource not found");
  } else if (apiError.status >= 500) {
    console.error("Server error - please try again later");
  } else {
    console.error("Request failed:", apiError.message);
  }
}

// Global error handler for mutations
function handleMutationError(error: unknown): void {
  const apiError = error as ApiError;

  if (apiError.status === 422 && apiError.errors) {
    // Validation errors - these are typically handled at the component level
    console.error("Validation failed:", apiError.errors);
  } else {
    handleQueryError(error);
  }
}

// Create and configure the QueryClient
export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Only show error if query was explicitly meant to show errors
        if (query.meta?.showErrorToast !== false) {
          handleQueryError(error);
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        // Only show error if mutation was explicitly meant to show errors
        if (mutation.meta?.showErrorToast !== false) {
          handleMutationError(error);
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME,
        gcTime: DEFAULT_GC_TIME,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error) => {
          const apiError = error as ApiError;
          // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
          if (
            apiError.status >= 400 &&
            apiError.status < 500 &&
            apiError.status !== 408 &&
            apiError.status !== 429
          ) {
            return false;
          }
          // Retry up to 3 times for server errors
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: false, // Don't retry mutations by default
      },
    },
  });
}

// Singleton instance for use throughout the app
export const queryClient = createQueryClient();

// Query key factory for consistent key generation
export const queryKeys = {
  // Categories
  categories: {
    all: ["categories"] as const,
    lists: () => [...queryKeys.categories.all, "list"] as const,
    list: (params?: object) => [...queryKeys.categories.lists(), params] as const,
    details: () => [...queryKeys.categories.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.categories.details(), id] as const,
  },

  // Ingredients
  ingredients: {
    all: ["ingredients"] as const,
    lists: () => [...queryKeys.ingredients.all, "list"] as const,
    list: (params?: object) => [...queryKeys.ingredients.lists(), params] as const,
    search: (query: string) => [...queryKeys.ingredients.all, "search", query] as const,
    details: () => [...queryKeys.ingredients.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.ingredients.details(), id] as const,
  },

  // Recipes
  recipes: {
    all: ["recipes"] as const,
    lists: () => [...queryKeys.recipes.all, "list"] as const,
    list: (params?: object) => [...queryKeys.recipes.lists(), params] as const,
    search: (params?: object) => [...queryKeys.recipes.all, "search", params] as const,
    details: () => [...queryKeys.recipes.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.recipes.details(), id] as const,
  },

  // Ratings
  ratings: {
    all: ["ratings"] as const,
    byRecipe: (recipeId: number) => [...queryKeys.ratings.all, "recipe", recipeId] as const,
    byRecipeList: (recipeId: number, params?: object) =>
      [...queryKeys.ratings.byRecipe(recipeId), params] as const,
  },

  // Search
  search: {
    all: ["search"] as const,
    byIngredients: (ingredientIds: number[]) =>
      [...queryKeys.search.all, "ingredients", ingredientIds] as const,
    byBudget: (budgetCents: number, servings?: number) =>
      [...queryKeys.search.all, "budget", budgetCents, servings] as const,
  },
} as const;

// Type augmentation for React Query
declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ApiError;
    queryMeta: {
      showErrorToast?: boolean;
    };
    mutationMeta: {
      showErrorToast?: boolean;
    };
  }
}
