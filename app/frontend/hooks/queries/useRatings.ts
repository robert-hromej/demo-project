import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { queryKeys } from "@/lib/query-client";
import type { Rating, RatingsListResponse } from "@/types";

interface UseRatingsParams {
  page?: number;
  perPage?: number;
}

interface UseRatingsOptions {
  enabled?: boolean;
  keepPreviousData?: boolean;
}

// Fetch ratings for a specific recipe (paginated)
export function useRatings(
  recipeId: number,
  params?: UseRatingsParams,
  options?: UseRatingsOptions
) {
  return useQuery({
    queryKey: queryKeys.ratings.byRecipeList(recipeId, params),
    queryFn: async (): Promise<RatingsListResponse> => {
      const queryParams: Record<string, string> = {};

      if (params?.page) {
        queryParams.page = String(params.page);
      }
      if (params?.perPage) {
        queryParams.per_page = String(params.perPage);
      }

      return apiClient.get<RatingsListResponse>(
        `/recipes/${recipeId}/ratings`,
        {
          params:
            Object.keys(queryParams).length > 0 ? queryParams : undefined,
        }
      );
    },
    enabled: options?.enabled !== false && recipeId > 0,
    placeholderData: options?.keepPreviousData ? keepPreviousData : undefined,
  });
}

// Re-export types for convenience
export type { Rating, RatingsListResponse };
