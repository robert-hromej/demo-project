# frozen_string_literal: true

module Api
  module Entities
    class RecipeEntity < Grape::Entity
      expose :id
      expose :title
      expose :description
      expose :instructions, if: ->(_, opts) { opts[:full] }
      expose :prep_time_min
      expose :cook_time_min
      expose :total_time_min
      expose :servings
      expose :difficulty
      expose :image_url
      expose :est_cost_cents
      expose :est_cost_formatted do |recipe|
        format("%.2f UAH", recipe.est_cost_cents / 100.0)
      end
      expose :cost_per_serving_formatted do |recipe|
        format("%.2f UAH", recipe.cost_per_serving_cents / 100.0)
      end
      expose :avg_rating
      expose :ratings_count
      expose :category, using: CategoryEntity, if: ->(recipe, _) { recipe.category }
      expose :ingredients, using: RecipeIngredientEntity, if: ->(_, opts) { opts[:full] } do |recipe|
        recipe.recipe_ingredients.includes(:ingredient)
      end
      expose :created_at
      expose :updated_at

      # For search results
      expose :match_percentage, if: ->(_, opts) { opts[:search] }
      expose :matched_ingredients, if: ->(_, opts) { opts[:search] }
      expose :total_ingredients, if: ->(_, opts) { opts[:search] }
      expose :missing_ingredients, using: IngredientEntity, if: ->(_, opts) { opts[:search] && opts[:missing] }
    end
  end
end
