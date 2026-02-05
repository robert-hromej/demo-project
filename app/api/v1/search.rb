# frozen_string_literal: true

module Api
  module V1
    class Search < Grape::API
      helpers Api::Helpers::ApiHelpers

      resource :search do
        desc "Search recipes by available ingredients"
        params do
          requires :ingredient_ids, type: [Integer], allow_blank: false
          optional :match_percentage, type: Integer, default: 80
          optional :include_optional, type: Boolean, default: false
          optional :category_id, type: Integer
          optional :max_cost, type: Integer
          optional :page, type: Integer, default: 1
          optional :per_page, type: Integer, default: 20
        end
        post "by-ingredients" do
          status 200
          result = ::Recipes::SearchByIngredients.call(params: declared(params))
          data = handle_result(result)

          # Preload required ingredient IDs for all recipes in one query
          recipe_ids = data[:recipes].map { |item| item[:recipe].id }
          matched_ids = params[:ingredient_ids]

          required_ingredients_map = RecipeIngredient
            .where(recipe_id: recipe_ids, optional: false)
            .pluck(:recipe_id, :ingredient_id)
            .group_by(&:first)
            .transform_values { |pairs| pairs.map(&:last) }

          all_missing_ids = required_ingredients_map.values.flatten.uniq - matched_ids
          missing_ingredients_map = Ingredient.where(id: all_missing_ids).index_by(&:id)

          recipes_with_missing = data[:recipes].map do |item|
            recipe = item[:recipe]
            required_ids = required_ingredients_map[recipe.id] || []
            missing = (required_ids - matched_ids).filter_map { |id| missing_ingredients_map[id] }

            {
              recipe: recipe,
              match_percentage: item[:match_percentage],
              matched_ingredients: item[:matched_ingredients],
              total_ingredients: item[:total_ingredients],
              missing_ingredients: missing,
            }
          end

          {
            data: recipes_with_missing.map do |item|
              Entities::RecipeEntity.represent(item[:recipe]).serializable_hash.merge(
                match_percentage: item[:match_percentage],
                matched_ingredients: item[:matched_ingredients],
                total_ingredients: item[:total_ingredients],
                missing_ingredients: Entities::IngredientEntity.represent(item[:missing_ingredients]).map(&:serializable_hash),
              )
            end,
            meta: data[:meta],
          }
        end

        desc "Search recipes by budget"
        params do
          requires :budget_cents, type: Integer
          optional :servings, type: Integer, default: 4
          optional :category_id, type: Integer
          optional :page, type: Integer, default: 1
          optional :per_page, type: Integer, default: 20
        end
        post "by-budget" do
          status 200
          result = ::Recipes::SearchByBudget.call(params: declared(params))
          data = handle_result(result)

          budget = params[:budget_cents]
          recipes_with_budget = data[:recipes].map do |item|
            recipe = item[:recipe]
            actual_cost = item[:actual_cost_cents]
            {
              recipe: recipe,
              actual_cost_cents: actual_cost,
              fits_budget: actual_cost <= budget,
              remaining_budget_cents: [budget - actual_cost, 0].max,
              budget_usage_percentage: item[:budget_usage_percentage],
            }
          end

          {
            data: recipes_with_budget.map do |item|
              Entities::RecipeEntity.represent(item[:recipe]).serializable_hash.merge(
                actual_cost_cents: item[:actual_cost_cents],
                fits_budget: item[:fits_budget],
                remaining_budget_cents: item[:remaining_budget_cents],
                budget_usage_percentage: item[:budget_usage_percentage],
              )
            end,
            meta: data[:meta],
          }
        end
      end
    end
  end
end
