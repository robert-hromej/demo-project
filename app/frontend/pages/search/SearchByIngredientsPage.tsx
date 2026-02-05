import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useSearchStore } from "@/stores/search";
import { useIngredientsSearch } from "@/hooks/queries/useIngredients";
import { searchApi } from "@/api/search";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge, DifficultyBadge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Alert } from "@/components/ui/Alert";
import { Search, X, Plus, Clock, DollarSign, ChefHat, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Ingredient, RecipeWithIngredientMatch } from "@/types";

export default function SearchByIngredientsPage() {
  const {
    selectedIngredients,
    matchPercentage,
    includeOptional,
    addIngredient,
    removeIngredient,
    clearIngredients,
    setMatchPercentage,
    setIncludeOptional,
  } = useSearchStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<RecipeWithIngredientMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const { data: searchResults, isLoading: isSearchingIngredients } =
    useIngredientsSearch(searchQuery);

  const handleAddIngredient = useCallback(
    (ingredient: Ingredient) => {
      addIngredient(ingredient);
      setSearchQuery("");
    },
    [addIngredient]
  );

  const handleSearch = async () => {
    if (selectedIngredients.length === 0) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await searchApi.byIngredients({
        ingredientIds: selectedIngredients.map((i) => i.id),
        matchPercentage,
        includeOptional,
      });
      setResults(response.data);
      setHasSearched(true);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Search by Ingredients</h1>
        <p className="text-gray-600 mt-1">
          Enter the ingredients you have, and we&apos;ll find recipes you can make
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Ingredient Selection Panel */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader title="Your Ingredients" />
            <CardBody>
              {/* Search Input */}
              <div className="relative mb-4">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ingredients..."
                  leftIcon={<Search />}
                />

                {/* Search Results Dropdown */}
                {searchQuery.length >= 2 && (
                  <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg max-h-60 overflow-y-auto">
                    {isSearchingIngredients ? (
                      <div className="p-3 text-center">
                        <LoadingSpinner size="sm" />
                      </div>
                    ) : searchResults && searchResults.length > 0 ? (
                      searchResults
                        .filter((i) => !selectedIngredients.some((s) => s.id === i.id))
                        .map((ingredient) => (
                          <button
                            key={ingredient.id}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between transition-colors"
                            onClick={() => handleAddIngredient(ingredient)}
                          >
                            <span className="text-sm text-gray-900">{ingredient.name}</span>
                            <Plus className="h-4 w-4 text-gray-400" />
                          </button>
                        ))
                    ) : (
                      <p className="p-3 text-sm text-gray-500 text-center">No ingredients found</p>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Ingredients */}
              {selectedIngredients.length > 0 ? (
                <div className="space-y-2">
                  {selectedIngredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="flex items-center justify-between py-1.5 px-2 bg-orange-50 rounded-lg"
                    >
                      <span className="text-sm font-medium text-gray-900">{ingredient.name}</span>
                      <button
                        type="button"
                        onClick={() => removeIngredient(ingredient.id)}
                        className="p-0.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearIngredients}
                    className="w-full mt-2"
                  >
                    Clear All
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Start typing to add ingredients
                </p>
              )}
            </CardBody>
          </Card>

          {/* Search Options */}
          <Card>
            <CardHeader title="Options" />
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Percent className="h-4 w-4" />
                    Min Match: {matchPercentage}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="10"
                    value={matchPercentage}
                    onChange={(e) => setMatchPercentage(Number(e.target.value))}
                    className="w-full mt-2 accent-orange-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10%</span>
                    <span>100%</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeOptional}
                    onChange={(e) => setIncludeOptional(e.target.checked)}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Include optional ingredients</span>
                </label>
              </div>
            </CardBody>
          </Card>

          <Button
            fullWidth
            onClick={handleSearch}
            isLoading={isSearching}
            disabled={selectedIngredients.length === 0}
            leftIcon={<Search className="h-4 w-4" />}
          >
            Find Recipes
          </Button>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2">
          {searchError && (
            <Alert variant="error" className="mb-4">
              {searchError}
            </Alert>
          )}

          {isSearching && (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" label="Searching recipes..." />
            </div>
          )}

          {!isSearching && hasSearched && results.length === 0 && (
            <Card className="text-center py-12">
              <CardBody>
                <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
                <p className="text-gray-600">
                  Try adding more ingredients or lowering the match percentage
                </p>
              </CardBody>
            </Card>
          )}

          {!isSearching && results.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Found {results.length} recipes</p>

              {results.map((result) => (
                <Link key={result.id} to={`/recipes/${result.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardBody>
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="w-24 h-24 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                          {result.imageUrl ? (
                            <img
                              src={result.imageUrl}
                              alt={result.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ChefHat className="h-8 w-8 text-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">{result.title}</h3>
                            <DifficultyBadge difficulty={result.difficulty} />
                          </div>

                          {/* Match Bar */}
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  result.matchPercentage >= 80
                                    ? "bg-green-500"
                                    : result.matchPercentage >= 50
                                      ? "bg-yellow-500"
                                      : "bg-orange-500"
                                )}
                                style={{
                                  width: `${result.matchPercentage}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {result.matchPercentage}%
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge size="sm">
                              {result.matchedIngredients}/{result.totalIngredients} ingredients
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {result.totalTimeMin} min
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5" />
                              {result.estCostFormatted}
                            </span>
                          </div>

                          {result.avgRating !== null && (
                            <div className="mt-1">
                              <Rating value={result.avgRating} size="sm" />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {!hasSearched && !isSearching && (
            <Card className="text-center py-16">
              <CardBody>
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  What&apos;s in your kitchen?
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Add the ingredients you have on hand, and we&apos;ll find recipes you can make
                  right now.
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
