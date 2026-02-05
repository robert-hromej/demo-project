import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { queryKeys } from "@/lib/query-client";
import type { SearchByBudgetRequest, SearchByBudgetResponse } from "@/types";

interface UseSearchByBudgetOptions {
  onSuccess?: (data: SearchByBudgetResponse) => void;
  onError?: (error: Error) => void;
}

// Mutation hook for searching recipes by budget
export function useSearchByBudget(options?: UseSearchByBudgetOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SearchByBudgetRequest): Promise<SearchByBudgetResponse> => {
      // Convert camelCase to snake_case for API
      const body = {
        budget_cents: request.budgetCents,
        servings: request.servings,
        category_id: request.categoryId,
        page: request.page,
        per_page: request.perPage,
      };

      // Remove undefined values
      const cleanBody = Object.fromEntries(
        Object.entries(body).filter(([_, v]) => v !== undefined)
      );

      return apiClient.post<SearchByBudgetResponse>("/recipes/search_by_budget", cleanBody);
    },
    onSuccess: (data, variables) => {
      // Cache the search results
      queryClient.setQueryData(
        queryKeys.search.byBudget(variables.budgetCents, variables.servings),
        data
      );

      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

// Re-export types for convenience
export type { SearchByBudgetRequest, SearchByBudgetResponse };
