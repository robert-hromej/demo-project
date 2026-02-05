import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { useRecipe } from "@/hooks/queries/useRecipes";
import { useUpdateRecipe } from "@/hooks/mutations/useRecipeMutations";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ApiClientError } from "@/api/client";

export default function RecipeEditPage() {
  const { id } = useParams<{ id: string }>();
  const recipeId = Number(id);
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const { data: recipe, isLoading, isError, refetch } = useRecipe(recipeId);

  const updateMutation = useUpdateRecipe({
    onSuccess: (updated) => {
      navigate(`/recipes/${updated.id}`);
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        setApiError(error.message);
      } else {
        setApiError("An unexpected error occurred. Please try again.");
      }
    },
  });

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
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Recipe</h1>
      <RecipeForm
        initialData={recipe}
        onSubmit={(data) => {
          setApiError(null);
          updateMutation.mutate({ id: recipeId, ...data });
        }}
        onCancel={() => navigate(`/recipes/${recipeId}`)}
        isSubmitting={updateMutation.isPending}
        apiError={apiError}
      />
    </div>
  );
}
