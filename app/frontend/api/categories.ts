import { apiClient } from "./client";
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types";

export interface ListCategoriesParams {
  includeChildren?: boolean;
}

/**
 * List all root categories
 */
export async function listCategories(
  params?: ListCategoriesParams
): Promise<Category[]> {
  return apiClient.get<Category[]>("/categories", { params });
}

/**
 * Get a category by ID (includes children and parent)
 */
export async function getCategory(id: number): Promise<Category> {
  return apiClient.get<Category>(`/categories/${id}`);
}

/**
 * Create a new category (requires authentication)
 */
export async function createCategory(
  data: CreateCategoryRequest
): Promise<Category> {
  return apiClient.post<Category>("/categories", data);
}

/**
 * Update an existing category (requires authentication)
 */
export async function updateCategory(
  id: number,
  data: UpdateCategoryRequest
): Promise<Category> {
  return apiClient.put<Category>(`/categories/${id}`, data);
}

/**
 * Delete a category (requires authentication)
 */
export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}

export const categoriesApi = {
  list: listCategories,
  get: getCategory,
  create: createCategory,
  update: updateCategory,
  delete: deleteCategory,
};
