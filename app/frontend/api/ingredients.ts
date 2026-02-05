import { apiClient } from "./client";
import type {
  Ingredient,
  PaginatedResponse,
  CreateIngredientRequest,
  UpdateIngredientRequest,
  IngredientSearchParams,
} from "../types";

/**
 * List/search ingredients with pagination
 */
export async function listIngredients(
  params?: IngredientSearchParams
): Promise<PaginatedResponse<Ingredient>> {
  return apiClient.get<PaginatedResponse<Ingredient>>("/ingredients", {
    params,
  });
}

/**
 * Search ingredients by query string
 */
export async function searchIngredients(
  query: string,
  params?: Omit<IngredientSearchParams, "query">
): Promise<PaginatedResponse<Ingredient>> {
  return listIngredients({ query, ...params });
}

/**
 * Get an ingredient by ID
 */
export async function getIngredient(id: number): Promise<Ingredient> {
  return apiClient.get<Ingredient>(`/ingredients/${id}`);
}

/**
 * Create a new ingredient (requires authentication)
 */
export async function createIngredient(data: CreateIngredientRequest): Promise<Ingredient> {
  return apiClient.post<Ingredient>("/ingredients", data);
}

/**
 * Update an existing ingredient (requires authentication)
 */
export async function updateIngredient(
  id: number,
  data: UpdateIngredientRequest
): Promise<Ingredient> {
  return apiClient.put<Ingredient>(`/ingredients/${id}`, data);
}

/**
 * Delete an ingredient (requires authentication)
 */
export async function deleteIngredient(id: number): Promise<void> {
  await apiClient.delete(`/ingredients/${id}`);
}

export const ingredientsApi = {
  list: listIngredients,
  search: searchIngredients,
  get: getIngredient,
  create: createIngredient,
  update: updateIngredient,
  delete: deleteIngredient,
};
