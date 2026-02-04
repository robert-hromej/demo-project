# frozen_string_literal: true

module Ingredients
  class Delete < ApplicationService
    def call(ingredient:)
      yield check_no_recipe_ingredients(ingredient: ingredient)
      yield destroy_ingredient(ingredient: ingredient)

      Success(true)
    end

    private

    def check_no_recipe_ingredients(ingredient:)
      if ingredient.recipe_ingredients.exists?
        Failure(
          code: :has_dependent_records,
          message: "Cannot delete ingredient that is used in recipes",
        )
      else
        Success(true)
      end
    end

    def destroy_ingredient(ingredient:)
      if ingredient.destroy
        Success(true)
      else
        Failure(
          code: :destroy_failed,
          message: ingredient.errors.full_messages.join(", "),
        )
      end
    end
  end
end
