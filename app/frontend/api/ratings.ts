import { apiClient } from "./client";
import type { Rating, RatingsListResponse, CreateRatingRequest } from "../types";

export interface ListRatingsParams {
  page?: number;
  perPage?: number;
}

/**
 * List ratings for a recipe with pagination
 */
export async function listRatings(
  recipeId: number,
  params?: ListRatingsParams
): Promise<RatingsListResponse> {
  return apiClient.get<RatingsListResponse>(
    `/recipes/${recipeId}/ratings`,
    { params }
  );
}

/**
 * Create or update a rating for a recipe (requires authentication)
 * If the user already has a rating for this recipe, it will be updated
 */
export async function createRating(
  recipeId: number,
  data: CreateRatingRequest
): Promise<Rating> {
  return apiClient.post<Rating>(`/recipes/${recipeId}/ratings`, data);
}

/**
 * Delete the current user's rating for a recipe (requires authentication)
 */
export async function deleteRating(recipeId: number): Promise<void> {
  await apiClient.delete(`/recipes/${recipeId}/ratings`);
}

export const ratingsApi = {
  list: listRatings,
  create: createRating,
  delete: deleteRating,
};
