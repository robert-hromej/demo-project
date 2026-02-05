import { apiClient } from "./client";
import type {
  SearchByIngredientsRequest,
  SearchByIngredientsResponse,
  SearchByBudgetRequest,
  SearchByBudgetResponse,
} from "../types";

/**
 * Search recipes by available ingredients
 * Returns recipes that match the provided ingredients with match percentage
 */
export async function searchByIngredients(
  data: SearchByIngredientsRequest
): Promise<SearchByIngredientsResponse> {
  return apiClient.post<SearchByIngredientsResponse>("/search/by-ingredients", data);
}

/**
 * Search recipes by budget
 * Returns recipes that fit within the specified budget
 */
export async function searchByBudget(data: SearchByBudgetRequest): Promise<SearchByBudgetResponse> {
  return apiClient.post<SearchByBudgetResponse>("/search/by-budget", data);
}

export const searchApi = {
  byIngredients: searchByIngredients,
  byBudget: searchByBudget,
};
