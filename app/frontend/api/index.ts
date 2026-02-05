// Re-export API client utilities
export {
  apiClient,
  ApiClientError,
  getToken,
  setToken,
  removeToken,
  isAuthenticated,
  toApiFormat,
  fromApiFormat,
} from "./client";
export type { ApiError, ApiErrorType, RequestOptions } from "./client";

// Re-export API service modules
export { authApi, register, login, getMe, logout } from "./auth";
export {
  categoriesApi,
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./categories";
export type { ListCategoriesParams } from "./categories";

export {
  ingredientsApi,
  listIngredients,
  searchIngredients,
  getIngredient,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "./ingredients";

export {
  recipesApi,
  listRecipes,
  searchRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from "./recipes";

export { ratingsApi, listRatings, createRating, deleteRating } from "./ratings";
export type { ListRatingsParams } from "./ratings";

export { searchApi, searchByIngredients, searchByBudget } from "./search";
