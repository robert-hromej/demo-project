# frozen_string_literal: true

module Recipes
  class Delete < ApplicationService
    def call(id:)
      recipe = yield find_recipe(id: id)
      yield destroy_recipe(recipe: recipe)

      Success(true)
    end

    private

    def find_recipe(id:)
      recipe = Recipe.find_by(id: id)
      return Success(recipe) if recipe

      Failure(not_found_error(resource: "Recipe"))
    end

    def destroy_recipe(recipe:)
      if recipe.destroy
        Success(true)
      else
        Failure(
          code: :destroy_failed,
          message: recipe.errors.full_messages.join(", "),
        )
      end
    end
  end
end
