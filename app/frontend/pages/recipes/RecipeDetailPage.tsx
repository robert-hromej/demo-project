import { useParams, Link } from "react-router-dom";
import { useRecipe } from "@/hooks/queries/useRecipes";
import { useRatings } from "@/hooks/queries/useRatings";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, DifficultyBadge, CategoryBadge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Alert } from "@/components/ui/Alert";
import {
  Clock,
  DollarSign,
  Users,
  ChefHat,
  ArrowLeft,
  CheckCircle2,
  Circle,
} from "lucide-react";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const recipeId = Number(id);

  const { data: recipe, isLoading, isError, refetch } = useRecipe(recipeId);
  const { data: ratingsData } = useRatings(recipeId, { page: 1, perPage: 5 });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" label="Loading recipe..." />
      </div>
    );
  }

  if (isError || !recipe) {
    return (
      <div className="py-12">
        <Alert variant="error" title="Failed to load recipe">
          The recipe could not be found or an error occurred.
        </Alert>
        <div className="mt-4 flex gap-3">
          <Button onClick={() => refetch()}>Try Again</Button>
          <Link to="/recipes">
            <Button variant="outline">Back to Recipes</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Link
        to="/recipes"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to recipes
      </Link>

      {/* Recipe Header */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image */}
        <div className="md:w-1/3">
          <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden">
            {recipe.imageUrl ? (
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ChefHat className="h-20 w-20 text-gray-300" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="md:w-2/3 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {recipe.category && (
              <CategoryBadge category={recipe.category.name} />
            )}
            <DifficultyBadge difficulty={recipe.difficulty} />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">{recipe.title}</h1>

          {recipe.description && (
            <p className="text-gray-600 text-lg">{recipe.description}</p>
          )}

          {/* Rating */}
          {recipe.avgRating !== null && (
            <Rating
              value={recipe.avgRating}
              size="lg"
              showValue
              reviewCount={recipe.ratingsCount}
            />
          )}

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Total Time</p>
                <p className="text-sm">{recipe.totalTimeMin} min</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Estimated Cost</p>
                <p className="text-sm">{recipe.estCostFormatted}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Servings</p>
                <p className="text-sm">{recipe.servings}</p>
              </div>
            </div>
          </div>

          {/* Time Breakdown */}
          <div className="flex gap-4 text-sm text-gray-500">
            <span>Prep: {recipe.prepTimeMin} min</span>
            <span>Cook: {recipe.cookTimeMin} min</span>
            <span>Per serving: {recipe.costPerServingFormatted}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Ingredients */}
        <Card className="md:col-span-1">
          <CardHeader
            title="Ingredients"
            description={
              recipe.ingredients
                ? `${recipe.ingredients.length} ingredients`
                : undefined
            }
          />
          <CardBody>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              <ul className="space-y-3">
                {recipe.ingredients.map((ri) => (
                  <li key={ri.id} className="flex items-start gap-2">
                    {ri.optional ? (
                      <Circle className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">
                        {ri.quantity} {ri.unit}
                      </span>{" "}
                      <span className="text-gray-600">
                        {ri.ingredient.name}
                      </span>
                      {ri.optional && (
                        <Badge size="sm" variant="default" className="ml-2">
                          optional
                        </Badge>
                      )}
                      {ri.notes && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {ri.notes}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {ri.estimatedCostFormatted}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No ingredients listed.</p>
            )}
          </CardBody>
        </Card>

        {/* Instructions */}
        <Card className="md:col-span-2">
          <CardHeader title="Instructions" />
          <CardBody>
            {recipe.instructions ? (
              <div className="prose prose-gray max-w-none whitespace-pre-wrap">
                {recipe.instructions}
              </div>
            ) : (
              <p className="text-gray-500">No instructions available.</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Ratings Section */}
      {ratingsData && ratingsData.data.length > 0 && (
        <Card>
          <CardHeader
            title="Reviews"
            description={`${ratingsData.meta.totalCount} reviews`}
          />
          <CardBody>
            <div className="space-y-4">
              {ratingsData.data.map((rating) => (
                <div
                  key={rating.id}
                  className="border-b border-gray-100 last:border-0 pb-4 last:pb-0"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Rating value={rating.score} size="sm" />
                    <span className="text-sm font-medium text-gray-900">
                      {rating.user.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {rating.review && (
                    <p className="text-sm text-gray-600">{rating.review}</p>
                  )}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
