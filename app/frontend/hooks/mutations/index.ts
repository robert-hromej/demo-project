// Mutation hooks barrel export
export { useRegister, useLogin, useLogout, useCurrentUser } from "./useAuth";

export { useCreateRecipe, useUpdateRecipe, useDeleteRecipe } from "./useRecipeMutations";

export {
  useCreateIngredient,
  useUpdateIngredient,
  useDeleteIngredient,
} from "./useIngredientMutations";

export { useCreateCategory, useUpdateCategory, useDeleteCategory } from "./useCategoryMutations";

export { useCreateRating, useDeleteRating } from "./useRatingMutations";

// Re-export types
export type { AuthResponse, LoginRequest, RegisterRequest } from "./useAuth";

export type { Recipe, CreateRecipeRequest, UpdateRecipeRequest } from "./useRecipeMutations";

export type {
  Ingredient,
  CreateIngredientRequest,
  UpdateIngredientRequest,
} from "./useIngredientMutations";

export type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "./useCategoryMutations";

export type { Rating, CreateRatingRequest } from "./useRatingMutations";
