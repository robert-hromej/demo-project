import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { queryKeys } from "@/lib/query-client";
import type { Recipe, ApiResponse, PaginatedResponse, RecipeSearchParams } from "@/types";

interface UseRecipesOptions {
  enabled?: boolean;
  keepPreviousData?: boolean;
}

// Fetch all recipes (paginated)
export function useRecipes(params?: RecipeSearchParams, options?: UseRecipesOptions) {
  return useQuery({
    queryKey: queryKeys.recipes.list(params),
    queryFn: async (): Promise<PaginatedResponse<Recipe>> => {
      const queryParams: Record<string, string> = {};

      if (params?.query) {
        queryParams.query = params.query;
      }
      if (params?.categoryId) {
        queryParams.category_id = String(params.categoryId);
      }
      if (params?.difficulty) {
        queryParams.difficulty = params.difficulty;
      }
      if (params?.maxCost) {
        queryParams.max_cost = String(params.maxCost);
      }
      if (params?.maxPrepTime) {
        queryParams.max_prep_time = String(params.maxPrepTime);
      }
      if (params?.minRating) {
        queryParams.min_rating = String(params.minRating);
      }
      if (params?.sort) {
        queryParams.sort = params.sort;
      }
      if (params?.order) {
        queryParams.order = params.order;
      }
      if (params?.page) {
        queryParams.page = String(params.page);
      }
      if (params?.perPage) {
        queryParams.per_page = String(params.perPage);
      }

      return apiClient.get<PaginatedResponse<Recipe>>("/recipes", {
        params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      });
    },
    enabled: options?.enabled,
    placeholderData: options?.keepPreviousData ? keepPreviousData : undefined,
  });
}

// Search recipes with filters
export function useRecipesSearch(params: RecipeSearchParams, options?: UseRecipesOptions) {
  return useQuery({
    queryKey: queryKeys.recipes.search(params),
    queryFn: async (): Promise<PaginatedResponse<Recipe>> => {
      const queryParams: Record<string, string> = {};

      if (params.query) {
        queryParams.query = params.query;
      }
      if (params.categoryId) {
        queryParams.category_id = String(params.categoryId);
      }
      if (params.difficulty) {
        queryParams.difficulty = params.difficulty;
      }
      if (params.maxCost) {
        queryParams.max_cost = String(params.maxCost);
      }
      if (params.maxPrepTime) {
        queryParams.max_prep_time = String(params.maxPrepTime);
      }
      if (params.minRating) {
        queryParams.min_rating = String(params.minRating);
      }
      if (params.sort) {
        queryParams.sort = params.sort;
      }
      if (params.order) {
        queryParams.order = params.order;
      }
      if (params.page) {
        queryParams.page = String(params.page);
      }
      if (params.perPage) {
        queryParams.per_page = String(params.perPage);
      }

      return apiClient.get<PaginatedResponse<Recipe>>("/recipes/search", {
        params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      });
    },
    enabled: options?.enabled,
    staleTime: 30 * 1000, // 30 seconds for search results
    placeholderData: options?.keepPreviousData ? keepPreviousData : undefined,
  });
}

// Fetch single recipe by ID
export function useRecipe(id: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.recipes.detail(id),
    queryFn: async (): Promise<Recipe> => {
      const response = await apiClient.get<ApiResponse<Recipe> | Recipe>(`/recipes/${id}`);

      // Handle both wrapped and unwrapped responses
      return "data" in response ? response.data : response;
    },
    enabled: options?.enabled !== false && id > 0,
  });
}

// Re-export types for convenience
export type { Recipe, RecipeSearchParams };
