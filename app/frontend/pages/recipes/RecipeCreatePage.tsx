import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { useCreateRecipe } from "@/hooks/mutations/useRecipeMutations";
import { ApiClientError } from "@/api/client";

export default function RecipeCreatePage() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const createMutation = useCreateRecipe({
    onSuccess: (recipe) => {
      navigate(`/recipes/${recipe.id}`);
    },
    onError: (error) => {
      if (error instanceof ApiClientError) {
        setApiError(error.message);
      } else {
        setApiError("An unexpected error occurred. Please try again.");
      }
    },
  });

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Recipe</h1>
      <RecipeForm
        onSubmit={(data) => {
          setApiError(null);
          createMutation.mutate(data);
        }}
        onCancel={() => navigate("/recipes")}
        isSubmitting={createMutation.isPending}
        apiError={apiError}
      />
    </div>
  );
}
