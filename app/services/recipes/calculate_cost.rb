# frozen_string_literal: true

module Recipes
  class CalculateCost < ApplicationService
    def call(recipe:)
      total_cost = yield calculate_total_cost(recipe: recipe)
      yield update_recipe_cost(recipe: recipe, cost: total_cost)

      Success(recipe.reload)
    end

    private

    def calculate_total_cost(recipe:)
      total = recipe.recipe_ingredients.includes(:ingredient).sum(&:estimated_cost_cents)

      Success(total)
    rescue StandardError => error
      Failure(code: :calculation_error, message: error.message)
    end

    def update_recipe_cost(recipe:, cost:)
      if recipe.update(est_cost_cents: cost)
        Success(true)
      else
        Failure(validation_error(errors: recipe.errors.messages))
      end
    end
  end
end
