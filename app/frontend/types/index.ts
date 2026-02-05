// Common types for the application

// ============================================
// Pagination & API Response Types
// ============================================

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ============================================
// User & Auth Types
// ============================================

export interface User {
  id: number;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  passwordConfirmation: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ============================================
// Category Types
// ============================================

export interface CategoryParent {
  id: number;
  name: string;
  description: string | null;
  position: number;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  position: number;
  recipesCount: number;
  children?: Category[];
  parent?: CategoryParent;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: number;
  position?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  parentId?: number;
  position?: number;
}

// ============================================
// Ingredient Types
// ============================================

export interface Ingredient {
  id: number;
  name: string;
  nameUk: string;
  unitPriceCents: number;
  unitPriceFormatted: string;
  defaultUnit: string | null;
  category: string | null;
  imageUrl: string | null;
}

export interface CreateIngredientRequest {
  name: string;
  nameUk: string;
  defaultUnit?: string;
  category?: string;
  unitPriceCents?: number;
}

export interface UpdateIngredientRequest {
  name?: string;
  nameUk?: string;
  defaultUnit?: string;
  category?: string;
  unitPriceCents?: number;
}

export interface IngredientSearchParams {
  query?: string;
  category?: string;
  page?: number;
  perPage?: number;
}

// ============================================
// Recipe Types
// ============================================

export interface RecipeIngredient {
  id: number;
  quantity: number;
  unit: string;
  notes: string | null;
  optional: boolean;
  ingredient: Ingredient;
  estimatedCostCents: number;
  estimatedCostFormatted: string;
}

export interface Recipe {
  id: number;
  title: string;
  description: string | null;
  instructions?: string;
  prepTimeMin: number;
  cookTimeMin: number;
  totalTimeMin: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  imageUrl: string | null;
  estCostCents: number;
  estCostFormatted: string;
  costPerServingFormatted: string;
  avgRating: number | null;
  ratingsCount: number;
  category: Category | null;
  ingredients?: RecipeIngredient[];
  createdAt: string;
  updatedAt: string;
}

export interface RecipeIngredientInput {
  ingredientId: number;
  quantity: number;
  unit: string;
  notes?: string;
  optional?: boolean;
}

export interface CreateRecipeRequest {
  title: string;
  description?: string;
  instructions: string;
  categoryId?: number;
  prepTimeMin: number;
  cookTimeMin: number;
  servings?: number;
  difficulty?: "easy" | "medium" | "hard";
  ingredients?: RecipeIngredientInput[];
}

export interface UpdateRecipeRequest {
  title?: string;
  description?: string;
  instructions?: string;
  categoryId?: number;
  prepTimeMin?: number;
  cookTimeMin?: number;
  servings?: number;
  difficulty?: "easy" | "medium" | "hard";
  ingredients?: RecipeIngredientInput[];
}

export interface RecipeSearchParams {
  query?: string;
  categoryId?: number;
  difficulty?: "easy" | "medium" | "hard";
  maxCost?: number;
  maxPrepTime?: number;
  minRating?: number;
  sort?: "rating" | "cost" | "time" | "created_at";
  order?: "asc" | "desc";
  page?: number;
  perPage?: number;
}

// ============================================
// Rating Types
// ============================================

export interface Rating {
  id: number;
  score: number;
  review: string | null;
  user: User;
  createdAt: string;
}

export interface RatingsListMeta extends PaginationMeta {
  averageScore: number | null;
}

export interface RatingsListResponse {
  data: Rating[];
  meta: RatingsListMeta;
}

export interface CreateRatingRequest {
  score: number;
  review?: string;
}

// ============================================
// Search Types
// ============================================

export interface SearchByIngredientsRequest {
  ingredientIds: number[];
  matchPercentage?: number;
  includeOptional?: boolean;
  categoryId?: number;
  maxCost?: number;
  page?: number;
  perPage?: number;
}

export interface RecipeWithIngredientMatch extends Recipe {
  matchPercentage: number;
  matchedIngredients: number;
  totalIngredients: number;
  missingIngredients: Ingredient[];
}

export interface SearchByIngredientsResponse {
  data: RecipeWithIngredientMatch[];
  meta: PaginationMeta;
}

export interface SearchByBudgetRequest {
  budgetCents: number;
  servings?: number;
  categoryId?: number;
  page?: number;
  perPage?: number;
}

export interface RecipeWithBudgetInfo extends Recipe {
  actualCostCents: number;
  fitsBudget: boolean;
  remainingBudgetCents: number;
  budgetUsagePercentage: number;
}

export interface SearchByBudgetResponse {
  data: RecipeWithBudgetInfo[];
  meta: PaginationMeta;
}
