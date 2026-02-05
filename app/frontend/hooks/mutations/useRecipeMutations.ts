import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { queryKeys } from "@/lib/query-client";
import type {
  Recipe,
  ApiResponse,
  CreateRecipeRequest,
  UpdateRecipeRequest,
  RecipeIngredientInput,
} from "@/types";

interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

// Helper to convert recipe request to snake_case
function toSnakeCase(request: CreateRecipeRequest | UpdateRecipeRequest): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if ("title" in request && request.title !== undefined) {
    body.title = request.title;
  }
  if ("description" in request && request.description !== undefined) {
    body.description = request.description;
  }
  if ("instructions" in request && request.instructions !== undefined) {
    body.instructions = request.instructions;
  }
  if ("categoryId" in request && request.categoryId !== undefined) {
    body.category_id = request.categoryId;
  }
  if ("prepTimeMin" in request && request.prepTimeMin !== undefined) {
    body.prep_time_min = request.prepTimeMin;
  }
  if ("cookTimeMin" in request && request.cookTimeMin !== undefined) {
    body.cook_time_min = request.cookTimeMin;
  }
  if ("servings" in request && request.servings !== undefined) {
    body.servings = request.servings;
  }
  if ("difficulty" in request && request.difficulty !== undefined) {
    body.difficulty = request.difficulty;
  }
  if ("ingredients" in request && request.ingredients !== undefined) {
    body.recipe_ingredients_attributes = request.ingredients.map((ing: RecipeIngredientInput) => ({
      ingredient_id: ing.ingredientId,
      quantity: ing.quantity,
      unit: ing.unit,
      notes: ing.notes,
      optional: ing.optional,
    }));
  }

  return body;
}

// Create recipe mutation
export function useCreateRecipe(options?: UseMutationOptions<Recipe>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateRecipeRequest): Promise<Recipe> => {
      const body = toSnakeCase(request);

      const response = await apiClient.post<ApiResponse<Recipe> | Recipe>("/recipes", {
        recipe: body,
      });

      return "data" in response ? response.data : response;
    },
    onSuccess: (data) => {
      // Invalidate recipes list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.lists() });

      // Add the new recipe to cache
      queryClient.setQueryData(queryKeys.recipes.detail(data.id), data);

      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

// Update recipe mutation
export function useUpdateRecipe(options?: UseMutationOptions<Recipe>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...request
    }: UpdateRecipeRequest & { id: number }): Promise<Recipe> => {
      const body = toSnakeCase(request);

      const response = await apiClient.patch<ApiResponse<Recipe> | Recipe>(`/recipes/${id}`, {
        recipe: body,
      });

      return "data" in response ? response.data : response;
    },
    onSuccess: (data) => {
      // Update the recipe in cache
      queryClient.setQueryData(queryKeys.recipes.detail(data.id), data);

      // Invalidate recipes list to refetch with updated data
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.lists() });

      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

// Delete recipe mutation
export function useDeleteRecipe(options?: UseMutationOptions<void>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await apiClient.delete(`/recipes/${id}`);
    },
    onSuccess: (_, id) => {
      // Remove the recipe from cache
      queryClient.removeQueries({ queryKey: queryKeys.recipes.detail(id) });

      // Invalidate recipes list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.lists() });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

// Re-export types for convenience
export type { Recipe, CreateRecipeRequest, UpdateRecipeRequest };
