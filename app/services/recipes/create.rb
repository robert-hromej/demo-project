# frozen_string_literal: true

module Recipes
  class Create < ApplicationService
    def call(params:, user: nil)
      validated = yield validate(contract_class: Recipes::CreateContract, params: params)
      recipe = yield create_recipe(params: validated, user: user)
      yield create_ingredients(recipe: recipe, ingredients: validated[:ingredients]) if validated[:ingredients]
      yield calculate_cost(recipe: recipe)

      Success(recipe.reload)
    end

    private

    def create_recipe(params:, user:)
      recipe = Recipe.new(
        title: params[:title],
        description: params[:description],
        instructions: params[:instructions],
        category_id: params[:category_id],
        prep_time_min: params[:prep_time_min],
        cook_time_min: params[:cook_time_min],
        servings: params[:servings] || 4,
        difficulty: params[:difficulty] || "easy",
        image_url: params[:image_url],
      )
      # NOTE: user parameter is for future use when recipes can be associated with users

      if recipe.save
        Success(recipe)
      else
        Failure(validation_error(errors: recipe.errors.messages))
      end
    end

    def create_ingredients(recipe:, ingredients:)
      ActiveRecord::Base.transaction do
        ingredients.each do |ing|
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
