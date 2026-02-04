# Патерни Frontend

## Огляд

Frontend RecipeMatch використовує React 19 з TypeScript, Vite та Tailwind CSS. Цей документ охоплює архітектурні патерни, структуру компонентів та найкращі практики.

```
┌─────────────────────────────────────────────────────┐
│                 Архітектура Frontend                │
├─────────────────────────────────────────────────────┤
│                                                      │
│   Pages (Компоненти маршрутів)                      │
│        │                                            │
│        ▼                                            │
│   Feature Components                                │
│        │                                            │
│        ▼                                            │
│   UI Components (перевикористовувані)               │
│        │                                            │
│        ├── Stores (Zustand) ◄── API Client          │
│        │                                            │
│        └── Hooks (кастомні)                         │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Структура директорій

```
app/frontend/
├── entrypoints/
│   └── application.tsx          # Головна точка входу
├── components/
│   ├── layouts/                  # Компоненти макетів
│   │   ├── MainLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── ui/                       # Перевикористовувані UI компоненти
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Modal.tsx
│       ├── Table.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Spinner.tsx
│       ├── StarRating.tsx
│       └── ErrorBoundary.tsx
├── pages/                        # Компоненти сторінок (маршрути)
│   ├── Dashboard.tsx
│   ├── NotFound.tsx
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── recipes/
│   │   ├── RecipesList.tsx
│   │   ├── RecipeShow.tsx
│   │   ├── RecipeForm.tsx
│   │   └── RecipeSearch.tsx
│   ├── categories/
│   │   └── CategoriesList.tsx
│   └── ingredients/
│       └── IngredientSelector.tsx
├── api/
│   ├── client.ts                 # Базовий API клієнт
│   ├── auth.ts                   # Ендпоінти авторизації
│   ├── recipes.ts                # Ендпоінти рецептів
│   ├── categories.ts             # Ендпоінти категорій
│   ├── ingredients.ts            # Ендпоінти інгредієнтів
│   └── ratings.ts                # Ендпоінти рейтингів
├── stores/
│   ├── authStore.ts              # Стан авторизації
│   ├── recipesStore.ts           # Стан рецептів
│   └── searchStore.ts            # Стан пошуку
├── hooks/
│   ├── useAuth.ts
│   ├── useRecipes.ts
│   ├── useSearch.ts
│   └── useDebounce.ts
├── types/
│   └── index.ts                  # Типи TypeScript
├── utils/
│   ├── formatters.ts             # Форматери грошей, дат
│   └── validators.ts             # Валідація форм
├── styles/
│   └── index.css                 # Імпорти Tailwind
└── App.tsx                       # Кореневий компонент
```

---

## Типи TypeScript

```typescript
// app/frontend/types/index.ts

// Типи користувача
export interface User {
  id: number;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Типи категорій
export interface Category {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  recipes_count: number;
  children: Category[];
}

// Типи інгредієнтів
export interface Ingredient {
  id: number;
  name: string;
  name_uk: string;
  unit_price_cents: number;
  unit_price_formatted: string;
  default_unit: string;
  category: string | null;
  image_url: string | null;
}

// Типи рецептів
export interface RecipeIngredient {
  id: number;
  name: string;
  name_uk: string;
  quantity: number;
  unit: string;
  notes: string | null;
  optional: boolean;
  estimated_cost_cents: number;
  estimated_cost_formatted: string;
}

export interface Recipe {
  id: number;
  title: string;
  description: string | null;
  instructions: string;
  category: Category | null;
  prep_time_min: number;
  cook_time_min: number;
  total_time_min: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  image_url: string | null;
  est_cost_cents: number;
  est_cost_formatted: string;
  cost_per_serving_formatted: string;
  avg_rating: number;
  ratings_count: number;
  ingredients?: RecipeIngredient[];
  created_at: string;
  updated_at: string;
}

export interface RecipeSearchResult extends Recipe {
  total_ingredients: number;
  matched_ingredients: number;
  match_percentage: number;
  missing_ingredients?: Ingredient[];
}

// Типи рейтингів
export interface Rating {
  id: number;
  score: number;
  review: string | null;
  user: Pick<User, 'id' | 'name' | 'avatar_url'>;
  created_at: string;
}

// Типи відповідей API
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// Типи пошуку
export interface IngredientSearchParams {
  ingredient_ids: number[];
  match_percentage?: number;
  include_optional?: boolean;
  category_id?: number;
  max_cost?: number;
}

export interface BudgetSearchParams {
  budget_cents: number;
  servings?: number;
  category_id?: number;
}
```

---

## API клієнт

```typescript
// app/frontend/api/client.ts

const API_BASE_URL = '/api/v1';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private buildUrl(path: string, params?: RequestOptions['params']): string {
    const url = new URL(`${this.baseUrl}${path}`, window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async request<T>(
    method: string,
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, body, ...rest } = options;
    const url = this.buildUrl(path, params);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...rest.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      ...rest,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.error || error);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, options);
  }

  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, { ...options, body });
  }

  async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, { ...options, body });
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, options);
  }
}

export class ApiError extends Error {
  code: string;
  details?: Record<string, string[]>;

  constructor(error: { code: string; message: string; details?: Record<string, string[]> }) {
    super(error.message);
    this.code = error.code;
    this.details = error.details;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
```

### Модулі API

```typescript
// app/frontend/api/recipes.ts
import { apiClient } from './client';
import type { Recipe, RecipeSearchResult, PaginatedResponse, IngredientSearchParams, BudgetSearchParams } from '../types';

export const recipesApi = {
  getAll: (params?: {
    page?: number;
    per_page?: number;
    category_id?: number;
    search?: string;
    difficulty?: string;
  }) => apiClient.get<PaginatedResponse<Recipe>>('/recipes', { params }),

  getById: (id: number) =>
    apiClient.get<{ data: Recipe }>(`/recipes/${id}`),

  create: (data: Partial<Recipe>) =>
    apiClient.post<{ data: Recipe }>('/recipes', data),

  update: (id: number, data: Partial<Recipe>) =>
    apiClient.put<{ data: Recipe }>(`/recipes/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/recipes/${id}`),

  searchByIngredients: (params: IngredientSearchParams) =>
    apiClient.post<PaginatedResponse<RecipeSearchResult>>(
      '/search/by-ingredients',
      params
    ),

  searchByBudget: (params: BudgetSearchParams) =>
    apiClient.post<PaginatedResponse<RecipeSearchResult>>(
      '/search/by-budget',
      params
    ),
};
```

```typescript
// app/frontend/api/auth.ts
import { apiClient } from './client';
import type { User } from '../types';

interface AuthResponse {
  data: {
    user: User;
    token: string;
  };
}

export const authApi = {
  register: (data: {
    email: string;
    password: string;
    password_confirmation: string;
    name: string;
  }) => apiClient.post<AuthResponse>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  me: () => apiClient.get<{ data: User }>('/auth/me'),
};
```

---

## Сховища Zustand

```typescript
// app/frontend/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth';
import type { User, AuthState } from '../types';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    password_confirmation: string;
    name: string;
  }) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await authApi.login({ email, password });
        const { user, token } = response.data;

        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },

      register: async (data) => {
        const response = await authApi.register(data);
        const { user, token } = response.data;

        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchUser: async () => {
        try {
          const response = await authApi.me();
          set({ user: response.data, isAuthenticated: true });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
```

```typescript
// app/frontend/stores/searchStore.ts
import { create } from 'zustand';
import { recipesApi } from '../api/recipes';
import type { Ingredient, RecipeSearchResult } from '../types';

interface SearchStore {
  // Стан
  selectedIngredients: Ingredient[];
  budget: number | null;
  matchPercentage: number;
  results: RecipeSearchResult[];
  isLoading: boolean;
  error: string | null;

  // Дії
  addIngredient: (ingredient: Ingredient) => void;
  removeIngredient: (id: number) => void;
  clearIngredients: () => void;
  setBudget: (budget: number | null) => void;
  setMatchPercentage: (percentage: number) => void;
  searchByIngredients: () => Promise<void>;
  searchByBudget: () => Promise<void>;
  clearResults: () => void;
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  selectedIngredients: [],
  budget: null,
  matchPercentage: 80,
  results: [],
  isLoading: false,
  error: null,

  addIngredient: (ingredient) => {
    const { selectedIngredients } = get();
    if (!selectedIngredients.find((i) => i.id === ingredient.id)) {
      set({ selectedIngredients: [...selectedIngredients, ingredient] });
    }
  },

  removeIngredient: (id) => {
    const { selectedIngredients } = get();
    set({
      selectedIngredients: selectedIngredients.filter((i) => i.id !== id),
    });
  },

  clearIngredients: () => {
    set({ selectedIngredients: [], results: [] });
  },

  setBudget: (budget) => {
    set({ budget });
  },

  setMatchPercentage: (matchPercentage) => {
    set({ matchPercentage });
  },

  searchByIngredients: async () => {
    const { selectedIngredients, matchPercentage } = get();
    if (selectedIngredients.length === 0) return;

    set({ isLoading: true, error: null });

    try {
      const response = await recipesApi.searchByIngredients({
        ingredient_ids: selectedIngredients.map((i) => i.id),
        match_percentage: matchPercentage,
      });
      set({ results: response.data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Search failed',
        isLoading: false,
      });
    }
  },

  searchByBudget: async () => {
    const { budget } = get();
    if (!budget) return;

    set({ isLoading: true, error: null });

    try {
      const response = await recipesApi.searchByBudget({
        budget_cents: budget * 100, // Конвертуємо грн у копійки
      });
      set({ results: response.data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Search failed',
        isLoading: false,
      });
    }
  },

  clearResults: () => {
    set({ results: [], error: null });
  },
}));
```

---

## UI компоненти

### Компонент Button

```typescript
// app/frontend/components/ui/Button.tsx
import React from 'react';
import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
};
```

### Компонент StarRating

```typescript
// app/frontend/components/ui/StarRating.tsx
import React, { useState } from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating ?? rating;

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => {
        const value = i + 1;
        const isFilled = value <= displayRating;
        const isHalf = !isFilled && value - 0.5 <= displayRating;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(value)}
            onMouseEnter={() => interactive && setHoverRating(value)}
            onMouseLeave={() => setHoverRating(null)}
            className={`${interactive ? 'cursor-pointer' : 'cursor-default'} focus:outline-none`}
          >
            <svg
              className={`${sizeClasses[size]} ${
                isFilled ? 'text-yellow-400' : isHalf ? 'text-yellow-300' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
      {!interactive && (
        <span className="ml-1 text-sm text-gray-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
```

### Компонент IngredientSelector

```typescript
// app/frontend/pages/ingredients/IngredientSelector.tsx
import React, { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { ingredientsApi } from '../../api/ingredients';
import { useSearchStore } from '../../stores/searchStore';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import type { Ingredient } from '../../types';

export const IngredientSelector: React.FC = () => {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const { selectedIngredients, addIngredient, removeIngredient, clearIngredients } =
    useSearchStore();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearch.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await ingredientsApi.getAll({ search: debouncedSearch });
        // Фільтруємо вже обрані
        const filtered = response.data.filter(
          (ing) => !selectedIngredients.find((s) => s.id === ing.id)
        );
        setSuggestions(filtered);
      } catch (error) {
        console.error('Failed to fetch ingredients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearch, selectedIngredients]);

  const handleSelect = (ingredient: Ingredient) => {
    addIngredient(ingredient);
    setSearch('');
    setSuggestions([]);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          label="Пошук інгредієнтів"
          placeholder="Введіть назву (напр. молоко, яйця...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Випадаючий список підказок */}
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {suggestions.map((ingredient) => (
              <li
                key={ingredient.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                onClick={() => handleSelect(ingredient)}
              >
                <span>{ingredient.name_uk}</span>
                <span className="text-sm text-gray-500">
                  {ingredient.unit_price_formatted}/{ingredient.default_unit}
                </span>
              </li>
            ))}
          </ul>
        )}

        {isLoading && (
          <div className="absolute right-3 top-9">
            <span className="text-sm text-gray-400">Пошук...</span>
          </div>
        )}
      </div>

      {/* Обрані інгредієнти */}
      {selectedIngredients.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-700">
              Обрані інгредієнти ({selectedIngredients.length})
            </h4>
            <button
              type="button"
              onClick={clearIngredients}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Очистити все
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedIngredients.map((ingredient) => (
              <Badge
                key={ingredient.id}
                variant="primary"
                removable
                onRemove={() => removeIngredient(ingredient.id)}
              >
                {ingredient.name_uk}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## Кастомні хуки

```typescript
// app/frontend/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

```typescript
// app/frontend/hooks/useRecipes.ts
import { useState, useEffect, useCallback } from 'react';
import { recipesApi } from '../api/recipes';
import type { Recipe, PaginatedResponse } from '../types';

interface UseRecipesOptions {
  categoryId?: number;
  search?: string;
  page?: number;
  perPage?: number;
}

export function useRecipes(options: UseRecipesOptions = {}) {
  const [data, setData] = useState<PaginatedResponse<Recipe> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecipes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await recipesApi.getAll({
        category_id: options.categoryId,
        search: options.search,
        page: options.page || 1,
        per_page: options.perPage || 20,
      });
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch recipes'));
    } finally {
      setIsLoading(false);
    }
  }, [options.categoryId, options.search, options.page, options.perPage]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return {
    recipes: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    refetch: fetchRecipes,
  };
}
```

---

## Компоненти сторінок

### Сторінка пошуку рецептів

```typescript
// app/frontend/pages/recipes/RecipeSearch.tsx
import React, { useState } from 'react';
import { useSearchStore } from '../../stores/searchStore';
import { IngredientSelector } from '../ingredients/IngredientSelector';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { RecipeCard } from './RecipeCard';

type SearchMode = 'ingredients' | 'budget';

export const RecipeSearch: React.FC = () => {
  const [mode, setMode] = useState<SearchMode>('ingredients');
  const {
    selectedIngredients,
    budget,
    setBudget,
    matchPercentage,
    setMatchPercentage,
    results,
    isLoading,
    error,
    searchByIngredients,
    searchByBudget,
  } = useSearchStore();

  const handleSearch = () => {
    if (mode === 'ingredients') {
      searchByIngredients();
    } else {
      searchByBudget();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Пошук рецептів</h1>

      {/* Вибір режиму */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg ${
            mode === 'ingredients'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setMode('ingredients')}
        >
          За інгредієнтами
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            mode === 'budget'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setMode('budget')}
        >
          За бюджетом
        </button>
      </div>

      {/* Поля пошуку */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        {mode === 'ingredients' ? (
          <div className="space-y-4">
            <IngredientSelector />

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                Мінімум збіг: {matchPercentage}%
              </label>
              <input
                type="range"
                min={50}
                max={100}
                step={10}
                value={matchPercentage}
                onChange={(e) => setMatchPercentage(Number(e.target.value))}
                className="flex-1"
              />
            </div>

            <Button
              onClick={handleSearch}
              disabled={selectedIngredients.length === 0}
              isLoading={isLoading}
            >
              Знайти рецепти
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              type="number"
              label="Бюджет (грн)"
              placeholder="Введіть суму в гривнях"
              value={budget || ''}
              onChange={(e) => setBudget(Number(e.target.value) || null)}
            />

            <Button
              onClick={handleSearch}
              disabled={!budget || budget <= 0}
              isLoading={isLoading}
            >
              Знайти рецепти
            </Button>
          </div>
        )}
      </div>

      {/* Повідомлення про помилку */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Результати */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Знайдено {results.length} рецептів
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                showMatchPercentage={mode === 'ingredients'}
              />
            ))}
          </div>
        </div>
      )}

      {/* Порожній стан */}
      {!isLoading && results.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {mode === 'ingredients'
            ? 'Оберіть інгредієнти для пошуку рецептів'
            : 'Вкажіть бюджет для пошуку рецептів'}
        </div>
      )}
    </div>
  );
};
```

---

## Допоміжні функції

```typescript
// app/frontend/utils/formatters.ts

export const formatMoney = (cents: number): string => {
  const uah = cents / 100;
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    minimumFractionDigits: 2,
  }).format(uah);
};

export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} хв`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} год ${mins} хв` : `${hours} год`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const getDifficultyLabel = (difficulty: string): string => {
  const labels: Record<string, string> = {
    easy: 'Легко',
    medium: 'Середньо',
    hard: 'Складно',
  };
  return labels[difficulty] || difficulty;
};

export const getDifficultyColor = (difficulty: string): string => {
  const colors: Record<string, string> = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };
  return colors[difficulty] || 'bg-gray-100 text-gray-800';
};
```

---

## Тестування Frontend компонентів

```typescript
// app/frontend/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading spinner when isLoading', () => {
    render(<Button isLoading>Loading</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies variant styles', () => {
    render(<Button variant="danger">Delete</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-600');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## Пов'язана документація

- [01-project-overview.md](01-project-overview.md) - Огляд проекту
- [02-tech-stack.md](02-tech-stack.md) - Технологічний стек
- [04-api-specification.md](04-api-specification.md) - Документація API
