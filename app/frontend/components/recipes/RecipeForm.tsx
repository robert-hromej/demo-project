import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, type SelectOption } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { useCategoriesList } from "@/hooks/queries/useCategories";
import { useIngredientsSearch } from "@/hooks/queries/useIngredients";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Search } from "lucide-react";
import type { Recipe, RecipeIngredientInput, Ingredient } from "@/types";

// ---------- Types ----------

interface IngredientRow extends RecipeIngredientInput {
  name: string; // display name for the selected ingredient
}

interface FormValues {
  title: string;
  description: string;
  instructions: string;
  categoryId: string;
  difficulty: "easy" | "medium" | "hard";
  prepTimeMin: string;
  cookTimeMin: string;
  servings: string;
  ingredients: IngredientRow[];
}

interface FormErrors {
  title?: string;
  instructions?: string;
  ingredients?: string;
}

export interface RecipeFormProps {
  initialData?: Recipe;
  onSubmit: (data: {
    title: string;
    description?: string;
    instructions: string;
    categoryId?: number;
    prepTimeMin: number;
    cookTimeMin: number;
    servings: number;
    difficulty: "easy" | "medium" | "hard";
    ingredients: RecipeIngredientInput[];
  }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  apiError?: string | null;
}

// ---------- Constants ----------

const DIFFICULTY_OPTIONS: SelectOption[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const UNIT_OPTIONS: SelectOption[] = [
  { value: "g", label: "g" },
  { value: "kg", label: "kg" },
  { value: "ml", label: "ml" },
  { value: "l", label: "l" },
  { value: "tsp", label: "tsp" },
  { value: "tbsp", label: "tbsp" },
  { value: "cup", label: "cup" },
  { value: "pcs", label: "pcs" },
  { value: "pinch", label: "pinch" },
  { value: "bunch", label: "bunch" },
  { value: "slice", label: "slice" },
  { value: "clove", label: "clove" },
];

// ---------- Helper ----------

function buildInitialValues(recipe?: Recipe): FormValues {
  if (!recipe) {
    return {
      title: "",
      description: "",
      instructions: "",
      categoryId: "",
      difficulty: "medium",
      prepTimeMin: "15",
      cookTimeMin: "30",
      servings: "4",
      ingredients: [],
    };
  }

  return {
    title: recipe.title,
    description: recipe.description || "",
    instructions: recipe.instructions || "",
    categoryId: recipe.category?.id ? String(recipe.category.id) : "",
    difficulty: recipe.difficulty,
    prepTimeMin: String(recipe.prepTimeMin),
    cookTimeMin: String(recipe.cookTimeMin),
    servings: String(recipe.servings),
    ingredients: (recipe.ingredients || []).map((ri) => ({
      ingredientId: ri.ingredient.id,
      quantity: ri.quantity,
      unit: ri.unit,
      notes: ri.notes || undefined,
      optional: ri.optional,
      name: ri.ingredient.name,
    })),
  };
}

// ---------- IngredientSearch sub-component ----------

function IngredientSearchInput({
  onSelect,
  excludeIds,
}: {
  onSelect: (ingredient: Ingredient) => void;
  excludeIds: number[];
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { data: results, isLoading } = useIngredientsSearch(query);

  const filteredResults = results?.filter((i) => !excludeIds.includes(i.id)) ?? [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        placeholder="Search ingredients..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
        leftIcon={<Search className="h-4 w-4" />}
      />
      {isOpen && query.length >= 2 && (
        <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {isLoading && (
            <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
          )}
          {!isLoading && filteredResults.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">No ingredients found</div>
          )}
          {filteredResults.map((ingredient) => (
            <button
              key={ingredient.id}
              type="button"
              className="w-full text-left px-4 py-2 text-sm hover:bg-orange-50 transition-colors"
              onClick={() => {
                onSelect(ingredient);
                setQuery("");
                setIsOpen(false);
              }}
            >
              <span className="font-medium">{ingredient.name}</span>
              {ingredient.defaultUnit && (
                <span className="text-gray-400 ml-2">({ingredient.defaultUnit})</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Main component ----------

export function RecipeForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  apiError,
}: RecipeFormProps) {
  const [values, setValues] = useState<FormValues>(() => buildInitialValues(initialData));
  const [errors, setErrors] = useState<FormErrors>({});

  const { data: categories } = useCategoriesList();

  const categoryOptions: SelectOption[] = (categories ?? []).map((cat) => ({
    value: String(cat.id),
    label: cat.name,
  }));

  const updateField = useCallback(
    <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      // Clear error for the field
      if (field in errors) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  // Ingredient management
  const addIngredient = useCallback((ingredient: Ingredient) => {
    const row: IngredientRow = {
      ingredientId: ingredient.id,
      quantity: 1,
      unit: ingredient.defaultUnit || "g",
      optional: false,
      name: ingredient.name,
    };
    setValues((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, row],
    }));
    setErrors((prev) => ({ ...prev, ingredients: undefined }));
  }, []);

  const removeIngredient = useCallback((index: number) => {
    setValues((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  }, []);

  const updateIngredient = useCallback(
    (index: number, field: keyof IngredientRow, value: string | number | boolean) => {
      setValues((prev) => ({
        ...prev,
        ingredients: prev.ingredients.map((row, i) =>
          i === index ? { ...row, [field]: value } : row
        ),
      }));
    },
    []
  );

  // Validation
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!values.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!values.instructions.trim()) {
      newErrors.instructions = "Instructions are required";
    }
    if (values.ingredients.length === 0) {
      newErrors.ingredients = "Add at least one ingredient";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      onSubmit({
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        instructions: values.instructions.trim(),
        categoryId: values.categoryId ? Number(values.categoryId) : undefined,
        difficulty: values.difficulty,
        prepTimeMin: Number(values.prepTimeMin) || 0,
        cookTimeMin: Number(values.cookTimeMin) || 0,
        servings: Number(values.servings) || 1,
        ingredients: values.ingredients.map((row) => ({
          ingredientId: row.ingredientId,
          quantity: Number(row.quantity) || 0,
          unit: row.unit,
          notes: row.notes || undefined,
          optional: row.optional,
        })),
      });
    },
    [values, validate, onSubmit]
  );

  const excludeIds = values.ingredients.map((r) => r.ingredientId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {apiError && (
        <Alert variant="error" title="Error">
          {apiError}
        </Alert>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <Input
          label="Title"
          value={values.title}
          onChange={(e) => updateField("title", e.target.value)}
          error={errors.title}
          placeholder="Enter recipe title"
        />

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
          <textarea
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-orange-500 focus:ring-orange-500/20 transition-colors duration-200"
            value={values.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
            placeholder="Brief description of the recipe"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">
            Instructions <span className="text-red-500">*</span>
          </label>
          <textarea
            className={cn(
              "block w-full rounded-lg border bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200",
              errors.instructions
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 focus:border-orange-500 focus:ring-orange-500/20"
            )}
            value={values.instructions}
            onChange={(e) => updateField("instructions", e.target.value)}
            rows={6}
            placeholder="Step-by-step cooking instructions"
          />
          {errors.instructions && (
            <p className="mt-1.5 text-sm text-red-600" role="alert">
              {errors.instructions}
            </p>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Select
          label="Category"
          options={categoryOptions}
          value={values.categoryId}
          onChange={(e) => updateField("categoryId", e.target.value)}
          placeholder="Select category"
        />

        <Select
          label="Difficulty"
          options={DIFFICULTY_OPTIONS}
          value={values.difficulty}
          onChange={(e) =>
            updateField("difficulty", e.target.value as "easy" | "medium" | "hard")
          }
        />

        <Input
          label="Prep Time (min)"
          type="number"
          min="0"
          value={values.prepTimeMin}
          onChange={(e) => updateField("prepTimeMin", e.target.value)}
        />

        <Input
          label="Cook Time (min)"
          type="number"
          min="0"
          value={values.cookTimeMin}
          onChange={(e) => updateField("cookTimeMin", e.target.value)}
        />
      </div>

      <Input
        label="Servings"
        type="number"
        min="1"
        value={values.servings}
        onChange={(e) => updateField("servings", e.target.value)}
        className="max-w-[200px]"
        fullWidth={false}
      />

      {/* Ingredients */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">
            Ingredients <span className="text-red-500">*</span>
          </h3>
          <span className="text-xs text-gray-400">{values.ingredients.length} added</span>
        </div>

        {errors.ingredients && (
          <p className="text-sm text-red-600" role="alert">
            {errors.ingredients}
          </p>
        )}

        {/* Ingredient rows */}
        {values.ingredients.length > 0 && (
          <div className="space-y-2">
            {values.ingredients.map((row, index) => (
              <div
                key={`${row.ingredientId}-${index}`}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3"
              >
                <span className="font-medium text-sm text-gray-900 min-w-[120px] truncate">
                  {row.name}
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={row.quantity}
                  onChange={(e) => updateIngredient(index, "quantity", Number(e.target.value))}
                  className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/20"
                  aria-label="Quantity"
                />

                <select
                  value={row.unit}
                  onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                  className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/20"
                  aria-label="Unit"
                >
                  {UNIT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={row.notes || ""}
                  onChange={(e) => updateIngredient(index, "notes", e.target.value)}
                  placeholder="Notes"
                  className="flex-1 min-w-0 rounded border border-gray-300 px-2 py-1 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/20"
                  aria-label="Notes"
                />

                <label className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={row.optional || false}
                    onChange={(e) => updateIngredient(index, "optional", e.target.checked)}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500/20"
                  />
                  Optional
                </label>

                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                  aria-label={`Remove ${row.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add ingredient search */}
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-gray-400 shrink-0" />
          <div className="flex-1">
            <IngredientSearchInput onSelect={addIngredient} excludeIds={excludeIds} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <Button type="submit" isLoading={isSubmitting}>
          {initialData ? "Update Recipe" : "Create Recipe"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default RecipeForm;
