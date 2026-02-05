import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { queryKeys } from "@/lib/query-client";
import type { Ingredient, PaginatedResponse, IngredientSearchParams } from "@/types";

interface UseIngredientsOptions {
  enabled?: boolean;
  keepPreviousData?: boolean;
}

// Search ingredients by query string
export function useIngredientsSearch(query: string, options?: UseIngredientsOptions) {
  return useQuery({
    queryKey: queryKeys.ingredients.search(query),
    queryFn: async (): Promise<Ingredient[]> => {
      if (!query.trim()) {
        return [];
      }

      const response = await apiClient.get<PaginatedResponse<Ingredient> | { data: Ingredient[] }>(
        "/ingredients",
        {
          params: {
            query: query.trim(),
            per_page: "20",
          },
        }
      );

      return response.data;
    },
    enabled: options?.enabled !== false && query.trim().length >= 2,
    staleTime: 30 * 1000, // 30 seconds for search results
    placeholderData: options?.keepPreviousData ? keepPreviousData : undefined,
  });
}

// Re-export types for convenience
export type { Ingredient, IngredientSearchParams };
