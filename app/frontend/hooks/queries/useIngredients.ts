import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { queryKeys } from "@/lib/query-client";
import type {
  Ingredient,
  ApiResponse,
  PaginatedResponse,
  IngredientSearchParams,
} from "@/types";

interface UseIngredientsOptions {
  enabled?: boolean;
  keepPreviousData?: boolean;
}

// Fetch all ingredients (paginated)
export function useIngredients(
  params?: IngredientSearchParams,
  options?: UseIngredientsOptions
) {
  return useQuery({
    queryKey: queryKeys.ingredients.list(params),
    queryFn: async (): Promise<PaginatedResponse<Ingredient>> => {
      const queryParams: Record<string, string> = {};

      if (params?.query) {
        queryParams.query = params.query;
      }
      if (params?.category) {
        queryParams.category = params.category;
      }
      if (params?.page) {
        queryParams.page = String(params.page);
      }
      if (params?.perPage) {
        queryParams.per_page = String(params.perPage);
      }

      return apiClient.get<PaginatedResponse<Ingredient>>("/ingredients", {
        params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      });
    },
    enabled: options?.enabled,
    placeholderData: options?.keepPreviousData ? keepPreviousData : undefined,
  });
}

// Search ingredients by query string
export function useIngredientsSearch(
  query: string,
  options?: UseIngredientsOptions
) {
  return useQuery({
    queryKey: queryKeys.ingredients.search(query),
    queryFn: async (): Promise<Ingredient[]> => {
      if (!query.trim()) {
        return [];
      }

      const response = await apiClient.get<
        PaginatedResponse<Ingredient> | { data: Ingredient[] }
      >("/ingredients", {
        params: {
          query: query.trim(),
          per_page: "20",
        },
      });

      return response.data;
    },
    enabled: options?.enabled !== false && query.trim().length >= 2,
    staleTime: 30 * 1000, // 30 seconds for search results
    placeholderData: options?.keepPreviousData ? keepPreviousData : undefined,
  });
}

// Fetch single ingredient by ID
export function useIngredient(
  id: number,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.ingredients.detail(id),
    queryFn: async (): Promise<Ingredient> => {
      const response = await apiClient.get<
        ApiResponse<Ingredient> | Ingredient
      >(`/ingredients/${id}`);

      // Handle both wrapped and unwrapped responses
      return "data" in response ? response.data : response;
    },
    enabled: options?.enabled !== false && id > 0,
  });
}

// Fetch multiple ingredients by IDs (for pre-fetching selected ingredients)
export function useIngredientsByIds(
  ids: number[],
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["ingredients", "byIds", ids.sort()],
    queryFn: async (): Promise<Ingredient[]> => {
      if (ids.length === 0) {
        return [];
      }

      // Fetch in parallel
      const promises = ids.map((id) =>
        apiClient.get<ApiResponse<Ingredient> | Ingredient>(
          `/ingredients/${id}`
        )
      );

      const results = await Promise.all(promises);

      return results.map((response) =>
        "data" in response ? response.data : response
      );
    },
    enabled: options?.enabled !== false && ids.length > 0,
  });
}

// Re-export types for convenience
export type { Ingredient, IngredientSearchParams };
