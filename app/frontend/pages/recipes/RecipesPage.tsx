import { useState, useMemo, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useRecipes } from "@/hooks/queries/useRecipes";
import { useCategoriesList } from "@/hooks/queries/useCategories";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DifficultyBadge, CategoryBadge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { LoadingSpinner, PageLoader } from "@/components/ui/LoadingSpinner";
import {
  Search,
  Clock,
  DollarSign,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  ChefHat,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecipeSearchParams, Recipe } from "@/types";

const DIFFICULTY_OPTIONS = [
  { value: "", label: "All Difficulties" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "rating", label: "Rating" },
  { value: "cost", label: "Cost" },
  { value: "time", label: "Preparation Time" },
  { value: "created_at", label: "Newest" },
];

const PER_PAGE = 12;

export default function RecipesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  // Parse search params into filter state
  const filters: RecipeSearchParams = useMemo(
    () => ({
      query: searchParams.get("query") || undefined,
      categoryId: searchParams.get("category") ? Number(searchParams.get("category")) : undefined,
      difficulty: (searchParams.get("difficulty") as RecipeSearchParams["difficulty"]) || undefined,
      sort: (searchParams.get("sort") as RecipeSearchParams["sort"]) || undefined,
      order: (searchParams.get("order") as "asc" | "desc") || undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      perPage: PER_PAGE,
    }),
    [searchParams]
  );

  // Local state for form inputs
  const [searchQuery, setSearchQuery] = useState(filters.query || "");

  // Fetch recipes and categories
  const recipesQuery = useRecipes(filters, { keepPreviousData: true });
  const categoriesQuery = useCategoriesList();

  const categoryOptions = useMemo(() => {
    const options = [{ value: "", label: "All Categories" }];
    if (categoriesQuery.data) {
      categoriesQuery.data.forEach((cat) => {
        options.push({ value: String(cat.id), label: cat.name });
      });
    }
    return options;
  }, [categoriesQuery.data]);

  // Update URL params
  const updateFilters = (newFilters: Partial<RecipeSearchParams>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change (except for page changes)
    if (!("page" in newFilters)) {
      params.delete("page");
    }

    setSearchParams(params);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    updateFilters({ query: searchQuery || undefined });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSearchParams({});
  };

  const hasActiveFilters =
    filters.query || filters.categoryId || filters.difficulty || filters.sort;

  const recipes = recipesQuery.data?.data || [];
  const meta = recipesQuery.data?.meta;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Recipes</h1>
          <p className="text-gray-600 mt-1">Discover delicious recipes for every occasion</p>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden"
          leftIcon={<Filter className="h-4 w-4" />}
        >
          Filters {hasActiveFilters && `(${Object.values(filters).filter(Boolean).length - 2})`}
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardBody>
          <div className="space-y-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes..."
                leftIcon={<Search />}
                fullWidth
              />
              <Button type="submit">Search</Button>
            </form>

            {/* Filter Toggle for Mobile */}
            <div className={cn("space-y-4", !showFilters && "hidden md:block")}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select
                  label="Category"
                  options={categoryOptions}
                  value={filters.categoryId ? String(filters.categoryId) : ""}
                  onChange={(e) =>
                    updateFilters({
                      categoryId: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
                <Select
                  label="Difficulty"
                  options={DIFFICULTY_OPTIONS}
                  value={filters.difficulty || ""}
                  onChange={(e) =>
                    updateFilters({
                      difficulty: (e.target.value as RecipeSearchParams["difficulty"]) || undefined,
                    })
                  }
                />
                <Select
                  label="Sort By"
                  options={SORT_OPTIONS}
                  value={filters.sort || ""}
                  onChange={(e) =>
                    updateFilters({
                      sort: (e.target.value as RecipeSearchParams["sort"]) || undefined,
                    })
                  }
                />
                <div className="flex items-end">
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      leftIcon={<X className="h-4 w-4" />}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Results Count */}
      {meta && (
        <div className="text-sm text-gray-600">
          Showing {recipes.length} of {meta.totalCount} recipes
          {filters.query && (
            <span>
              {" "}
              for &ldquo;<strong>{filters.query}</strong>&rdquo;
            </span>
          )}
        </div>
      )}

      {/* Loading State */}
      {recipesQuery.isLoading && <PageLoader label="Loading recipes..." />}

      {/* Error State */}
      {recipesQuery.isError && (
        <Card className="text-center py-12">
          <CardBody>
            <p className="text-red-600 mb-4">Failed to load recipes</p>
            <Button onClick={() => recipesQuery.refetch()}>Try Again</Button>
          </CardBody>
        </Card>
      )}

      {/* Empty State */}
      {!recipesQuery.isLoading && recipes.length === 0 && (
        <Card className="text-center py-12">
          <CardBody>
            <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </CardBody>
        </Card>
      )}

      {/* Recipe Grid */}
      {recipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            disabled={meta.currentPage <= 1}
            onClick={() => updateFilters({ page: meta.currentPage - 1 })}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {meta.currentPage} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={meta.currentPage >= meta.totalPages}
            onClick={() => updateFilters({ page: meta.currentPage + 1 })}
            rightIcon={<ChevronRight className="h-4 w-4" />}
          >
            Next
          </Button>
        </div>
      )}

      {/* Loading indicator for pagination */}
      {recipesQuery.isFetching && !recipesQuery.isLoading && (
        <div className="fixed bottom-4 right-4">
          <div className="bg-white rounded-lg shadow-lg p-3 flex items-center gap-2">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-gray-600">Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Recipe Card Component
function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link to={`/recipes/${recipe.id}`}>
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow group">
        {/* Image */}
        <div className="aspect-video bg-gray-100 relative overflow-hidden">
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ChefHat className="h-12 w-12 text-gray-300" />
            </div>
          )}
          {recipe.category && (
            <div className="absolute top-2 left-2">
              <CategoryBadge category={recipe.category.name} />
            </div>
          )}
        </div>

        <CardBody>
          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1 mb-2">
            {recipe.title}
          </h3>

          {recipe.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{recipe.description}</p>
          )}

          {/* Rating */}
          {recipe.avgRating !== null && (
            <div className="mb-3">
              <Rating
                value={recipe.avgRating}
                size="sm"
                showValue
                reviewCount={recipe.ratingsCount}
              />
            </div>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {recipe.totalTimeMin} min
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {recipe.estCostFormatted}
            </div>
            <DifficultyBadge difficulty={recipe.difficulty} />
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
