import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { queryKeys } from "@/lib/query-client";
import type { SearchByIngredientsRequest, SearchByIngredientsResponse } from "@/types";

interface UseSearchByIngredientsOptions {
  onSuccess?: (data: SearchByIngredientsResponse) => void;
  onError?: (error: Error) => void;
}

// Mutation hook for searching recipes by ingredients
export function useSearchByIngredients(options?: UseSearchByIngredientsOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      request: SearchByIngredientsRequest
    ): Promise<SearchByIngredientsResponse> => {
      // Convert camelCase to snake_case for API
      const body = {
        ingredient_ids: request.ingredientIds,
        match_percentage: request.matchPercentage,
        include_optional: request.includeOptional,
        category_id: request.categoryId,
        max_cost: request.maxCost,
        page: request.page,
        per_page: request.perPage,
      };

      // Remove undefined values
      const cleanBody = Object.fromEntries(
        Object.entries(body).filter(([_, v]) => v !== undefined)
      );

      return apiClient.post<SearchByIngredientsResponse>(
        "/recipes/search_by_ingredients",
        cleanBody
      );
    },
    onSuccess: (data, variables) => {
      // Cache the search results
      queryClient.setQueryData(queryKeys.search.byIngredients(variables.ingredientIds), data);

      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

// Re-export types for convenience
export type { SearchByIngredientsRequest, SearchByIngredientsResponse };
