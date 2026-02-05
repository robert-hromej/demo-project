import { useState } from "react";
import { Link } from "react-router-dom";
import { useSearchStore } from "@/stores/search";
import { useCategoriesList } from "@/hooks/queries/useCategories";
import { searchApi } from "@/api/search";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DifficultyBadge, CategoryBadge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Alert } from "@/components/ui/Alert";
import {
  Search,
  Clock,
  DollarSign,
  ChefHat,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RecipeWithBudgetInfo } from "@/types";

export default function SearchByBudgetPage() {
  const { budgetCents, servings, setBudget, setServings } = useSearchStore();
  const categoriesQuery = useCategoriesList();

  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [results, setResults] = useState<RecipeWithBudgetInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const budgetUah = budgetCents / 100;

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...(categoriesQuery.data?.map((cat) => ({
      value: String(cat.id),
      label: cat.name,
    })) || []),
  ];

  const handleSearch = async () => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await searchApi.byBudget({
        budgetCents,
        servings,
        categoryId,
      });
      setResults(response.data);
      setHasSearched(true);
    } catch (err) {
      setSearchError(
        err instanceof Error ? err.message : "Search failed. Please try again."
      );
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Search by Budget
        </h1>
        <p className="text-gray-600 mt-1">
          Set your budget and discover delicious meals you can afford
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Search Options Panel */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader title="Budget Settings" />
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
                    <Wallet className="h-4 w-4" />
                    Budget (UAH)
                  </label>
                  <Input
                    type="number"
                    value={budgetUah}
                    onChange={(e) =>
                      setBudget(Math.round(Number(e.target.value) * 100))
                    }
                    min={0}
                    step={10}
                    placeholder="Enter budget in UAH"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
                    <Users className="h-4 w-4" />
                    Servings
                  </label>
                  <Input
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(Number(e.target.value))}
                    min={1}
                    max={20}
                    placeholder="Number of servings"
                  />
                </div>

                <Select
                  label="Category"
                  options={categoryOptions}
                  value={categoryId ? String(categoryId) : ""}
                  onChange={(e) =>
                    setCategoryId(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                />
              </div>
            </CardBody>
          </Card>

          <Button
            fullWidth
            onClick={handleSearch}
            isLoading={isSearching}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No recipes found
                </h3>
                <p className="text-gray-600">
                  Try increasing your budget or adjusting the number of servings
                </p>
              </CardBody>
            </Card>
          )}

          {!isSearching && results.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Found {results.length} recipes within your budget
              </p>

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
                            <h3 className="font-semibold text-gray-900 truncate">
                              {result.title}
                            </h3>
                            <DifficultyBadge difficulty={result.difficulty} />
                            {result.category && (
                              <CategoryBadge category={result.category.name} />
                            )}
                          </div>

                          {/* Budget Bar */}
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  result.budgetUsagePercentage <= 50
                                    ? "bg-green-500"
                                    : result.budgetUsagePercentage <= 80
                                      ? "bg-yellow-500"
                                      : "bg-orange-500"
                                )}
                                style={{
                                  width: `${Math.min(result.budgetUsagePercentage, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {(result.actualCostCents / 100).toFixed(0)} UAH
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5" />
                              Remaining:{" "}
                              {(result.remainingBudgetCents / 100).toFixed(0)}{" "}
                              UAH
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {result.totalTimeMin} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {result.servings} servings
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
                <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Set your budget
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Enter your budget and the number of servings, and we&apos;ll
                  find recipes that fit your wallet.
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
