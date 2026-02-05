import { apiClient } from "./client";
import type {
  Recipe,
  PaginatedResponse,
  CreateRecipeRequest,
  UpdateRecipeRequest,
  RecipeSearchParams,
} from "../types";

/**
 * List/search recipes with pagination and filters
 */
export async function listRecipes(params?: RecipeSearchParams): Promise<PaginatedResponse<Recipe>> {
  return apiClient.get<PaginatedResponse<Recipe>>("/recipes", { params });
}

/**
 * Search recipes by query string
 */
export async function searchRecipes(
  query: string,
  params?: Omit<RecipeSearchParams, "query">
): Promise<PaginatedResponse<Recipe>> {
  return listRecipes({ query, ...params });
}

/**
 * Get a recipe by ID (includes full details with ingredients)
 */
export async function getRecipe(id: number): Promise<Recipe> {
  return apiClient.get<Recipe>(`/recipes/${id}`);
}

/**
 * Create a new recipe (requires authentication)
 */
export async function createRecipe(data: CreateRecipeRequest): Promise<Recipe> {
  return apiClient.post<Recipe>("/recipes", data);
}

/**
 * Update an existing recipe (requires authentication)
 */
export async function updateRecipe(id: number, data: UpdateRecipeRequest): Promise<Recipe> {
  return apiClient.put<Recipe>(`/recipes/${id}`, data);
}

/**
 * Delete a recipe (requires authentication)
 */
export async function deleteRecipe(id: number): Promise<void> {
  await apiClient.delete(`/recipes/${id}`);
}

export const recipesApi = {
  list: listRecipes,
  search: searchRecipes,
  get: getRecipe,
  create: createRecipe,
  update: updateRecipe,
  delete: deleteRecipe,
};
