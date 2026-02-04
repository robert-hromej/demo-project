# frozen_string_literal: true

module Recipes
  class Update < ApplicationService
    def call(id:, params:)
      recipe = yield find_recipe(id: id)
      validated = yield validate(contract_class: Recipes::UpdateContract, params: params)
      updated = yield update_recipe(recipe: recipe, params: validated)
      yield update_ingredients(recipe: updated, ingredients: validated[:ingredients]) if validated.key?(:ingredients)
      yield calculate_cost(recipe: updated)

      Success(updated.reload)
    end

    private

    def find_recipe(id:)
      recipe = Recipe.find_by(id: id)
      return Success(recipe) if recipe

      Failure(not_found_error(resource: "Recipe"))
    end

    def update_recipe(recipe:, params:)
      update_params = params.except(:ingredients)
      if recipe.update(update_params)
        Success(recipe)
      else
        Failure(validation_error(errors: recipe.errors.messages))
      end
    end

    def update_ingredients(recipe:, ingredients:)
      ActiveRecord::Base.transaction do
        recipe.recipe_ingredients.destroy_all

        ingredients&.each do |ing|
          RecipeIngredient.create!(
            recipe: recipe,
            ingredient_id: ing[:ingredient_id],
            quantity: ing[:quantity],
            unit: ing[:unit],
            notes: ing[:notes],
            optional: ing[:optional] || false,
          )
        end
      end

      Success(true)
    rescue ActiveRecord::RecordInvalid => error
      Failure(validation_error(errors: error.record.errors.messages))
    end

    def calculate_cost(recipe:)
      Recipes::CalculateCost.call(recipe: recipe)
    end
  end
end
