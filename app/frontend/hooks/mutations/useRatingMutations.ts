import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { queryKeys } from "@/lib/query-client";
import type { Rating, ApiResponse, CreateRatingRequest } from "@/types";

interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

// Create rating mutation
export function useCreateRating(
  recipeId: number,
  options?: UseMutationOptions<Rating>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateRatingRequest): Promise<Rating> => {
      const body = {
        score: request.score,
        review: request.review,
      };

      const response = await apiClient.post<ApiResponse<Rating> | Rating>(
        `/recipes/${recipeId}/ratings`,
        { rating: body }
      );

      return "data" in response ? response.data : response;
    },
    onSuccess: (data) => {
      // Invalidate ratings list to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.ratings.byRecipe(recipeId),
      });

      // Invalidate the recipe to update average rating
      queryClient.invalidateQueries({
        queryKey: queryKeys.recipes.detail(recipeId),
      });

      // Also invalidate recipe lists as they show avg rating
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.lists() });

      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

// Delete rating mutation
export function useDeleteRating(
  recipeId: number,
  options?: UseMutationOptions<void>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ratingId: number): Promise<void> => {
      await apiClient.delete(`/recipes/${recipeId}/ratings/${ratingId}`);
    },
    onSuccess: () => {
      // Invalidate ratings list to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.ratings.byRecipe(recipeId),
      });

      // Invalidate the recipe to update average rating
      queryClient.invalidateQueries({
        queryKey: queryKeys.recipes.detail(recipeId),
      });

      // Also invalidate recipe lists as they show avg rating
      queryClient.invalidateQueries({ queryKey: queryKeys.recipes.lists() });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}

// Re-export types for convenience
export type { Rating, CreateRatingRequest };
