import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { queryKeys } from "@/lib/query-client";
import type {
  Ingredient,
  ApiResponse,
  CreateIngredientRequest,
  UpdateIngredientRequest,
} from "@/types";

interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

// Helper to convert ingredient request to snake_case
function toSnakeCase(
  request: CreateIngredientRequest | UpdateIngredientRequest
): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if ("name" in request && request.name !== undefined) {
    body.name = request.name;
  }
  if ("nameUk" in request && request.nameUk !== undefined) {
    body.name_uk = request.nameUk;
  }
  if ("defaultUnit" in request && request.defaultUnit !== undefined) {
    body.default_unit = request.defaultUnit;
  }
  if ("category" in request && request.category !== undefined) {
    body.category = request.category;
  }
  if ("unitPriceCents" in request && request.unitPriceCents !== undefined) {
    body.unit_price_cents = request.unitPriceCents;
  }

  return body;
}

// Create ingredient mutation
export function useCreateIngredient(options?: UseMutationOptions<Ingredient>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateIngredientRequest): Promise<Ingredient> => {
      const body = toSnakeCase(request);

      const response = await apiClient.post<ApiResponse<Ingredient> | Ingredient>(
        "/ingredients",
        { ingredient: body }
      );

      return "data" in response ? response.data : response;
    },
    onSuccess: (data) => {
      // Invalidate ingredients list to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.ingredients.lists(),
      });

      // Add the new ingredient to cache
      queryClient.setQueryData(queryKeys.ingredients.detail(data.id), data);

      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

// Update ingredient mutation
export function useUpdateIngredient(options?: UseMutationOptions<Ingredient>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...request
    }: UpdateIngredientRequest & { id: number }): Promise<Ingredient> => {
      const body = toSnakeCase(request);

      const response = await apiClient.patch<ApiResponse<Ingredient> | Ingredient>(
        `/ingredients/${id}`,
        { ingredient: body }
      );

      return "data" in response ? response.data : response;
    },
    onSuccess: (data) => {
      // Update the ingredient in cache
      queryClient.setQueryData(queryKeys.ingredients.detail(data.id), data);

      // Invalidate ingredients list to refetch with updated data
      queryClient.invalidateQueries({
        queryKey: queryKeys.ingredients.lists(),
      });

      // Invalidate search results as they may contain this ingredient
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.ingredients.all, "search"],
      });

      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

// Delete ingredient mutation
export function useDeleteIngredient(options?: UseMutationOptions<void>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await apiClient.delete(`/ingredients/${id}`);
    },
    onSuccess: (_, id) => {
      // Remove the ingredient from cache
      queryClient.removeQueries({
        queryKey: queryKeys.ingredients.detail(id),
      });

      // Invalidate ingredients list to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.ingredients.lists(),
      });

      // Invalidate search results
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.ingredients.all, "search"],
      });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

// Re-export types for convenience
export type { Ingredient, CreateIngredientRequest, UpdateIngredientRequest };
