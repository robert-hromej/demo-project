import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { queryKeys } from "@/lib/query-client";
import type {
  Category,
  ApiResponse,
  PaginatedResponse,
  PaginationMeta,
} from "@/types";

interface UseCategoriesParams {
  page?: number;
  perPage?: number;
}

interface UseCategoriesOptions {
  enabled?: boolean;
}

// Fetch all categories (paginated)
export function useCategories(
  params?: UseCategoriesParams,
  options?: UseCategoriesOptions
) {
  return useQuery({
    queryKey: queryKeys.categories.list(params),
    queryFn: async (): Promise<PaginatedResponse<Category>> => {
      const queryParams: Record<string, string> = {};

      if (params?.page) {
        queryParams.page = String(params.page);
      }
      if (params?.perPage) {
        queryParams.per_page = String(params.perPage);
      }

      return apiClient.get<PaginatedResponse<Category>>("/categories", {
        params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      });
    },
    enabled: options?.enabled,
  });
}

// Fetch all categories without pagination (for dropdowns, etc.)
export function useCategoriesList(options?: UseCategoriesOptions) {
  return useQuery({
    queryKey: queryKeys.categories.lists(),
    queryFn: async (): Promise<Category[]> => {
      const response = await apiClient.get<
        PaginatedResponse<Category> | { data: Category[] }
      >("/categories", {
        params: { per_page: "100" },
      });

      // Handle both paginated and non-paginated responses
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // Categories don't change often - 10 minutes
    enabled: options?.enabled,
  });
}

// Fetch single category by ID
export function useCategory(
  id: number,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: async (): Promise<Category> => {
      const response = await apiClient.get<ApiResponse<Category> | Category>(
        `/categories/${id}`
      );

      // Handle both wrapped and unwrapped responses
      return "data" in response ? response.data : response;
    },
    enabled: options?.enabled !== false && id > 0,
  });
}

// Re-export types for convenience
export type { Category, PaginationMeta };
