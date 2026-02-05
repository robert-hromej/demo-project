import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { queryKeys } from "@/lib/query-client";
import type { Category, PaginatedResponse, PaginationMeta } from "@/types";

interface UseCategoriesOptions {
  enabled?: boolean;
}

// Fetch all categories without pagination (for dropdowns, etc.)
export function useCategoriesList(options?: UseCategoriesOptions) {
  return useQuery({
    queryKey: queryKeys.categories.lists(),
    queryFn: async (): Promise<Category[]> => {
      const response = await apiClient.get<PaginatedResponse<Category> | { data: Category[] }>(
        "/categories",
        {
          params: { per_page: "100" },
        }
      );

      // Handle both paginated and non-paginated responses
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // Categories don't change often - 10 minutes
    enabled: options?.enabled,
  });
}

// Re-export types for convenience
export type { Category, PaginationMeta };
