import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { queryKeys } from "@/lib/query-client";
import type { Category, ApiResponse, CreateCategoryRequest, UpdateCategoryRequest } from "@/types";

interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

// Helper to convert category request to snake_case
function toSnakeCase(
  request: CreateCategoryRequest | UpdateCategoryRequest
): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if ("name" in request && request.name !== undefined) {
    body.name = request.name;
  }
  if ("description" in request && request.description !== undefined) {
    body.description = request.description;
  }
  if ("parentId" in request && request.parentId !== undefined) {
    body.parent_id = request.parentId;
  }
  if ("position" in request && request.position !== undefined) {
    body.position = request.position;
  }

  return body;
}

// Create category mutation
export function useCreateCategory(options?: UseMutationOptions<Category>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateCategoryRequest): Promise<Category> => {
      const body = toSnakeCase(request);

      const response = await apiClient.post<ApiResponse<Category> | Category>("/categories", {
        category: body,
      });

      return "data" in response ? response.data : response;
    },
    onSuccess: (data) => {
      // Invalidate categories list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });

      // Add the new category to cache
      queryClient.setQueryData(queryKeys.categories.detail(data.id), data);

      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

// Update category mutation
export function useUpdateCategory(options?: UseMutationOptions<Category>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...request
    }: UpdateCategoryRequest & { id: number }): Promise<Category> => {
      const body = toSnakeCase(request);

      const response = await apiClient.patch<ApiResponse<Category> | Category>(
        `/categories/${id}`,
        { category: body }
      );

      return "data" in response ? response.data : response;
    },
    onSuccess: (data) => {
      // Update the category in cache
      queryClient.setQueryData(queryKeys.categories.detail(data.id), data);

      // Invalidate categories list to refetch with updated data
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });

      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

// Delete category mutation
export function useDeleteCategory(options?: UseMutationOptions<void>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await apiClient.delete(`/categories/${id}`);
    },
    onSuccess: (_, id) => {
      // Remove the category from cache
      queryClient.removeQueries({ queryKey: queryKeys.categories.detail(id) });

      // Invalidate categories list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });

      // Invalidate recipes as they may reference this category
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.lists() });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

// Re-export types for convenience
export type { Category, CreateCategoryRequest, UpdateCategoryRequest };
