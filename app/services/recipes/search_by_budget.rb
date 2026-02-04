# frozen_string_literal: true

module Recipes
  class SearchByBudget < ApplicationService
    DEFAULT_PER_PAGE = 20

    def call(params:)
      validated = yield validate(contract_class: Recipes::SearchByBudgetContract, params: params)
      recipes = yield find_recipes_within_budget(params: validated)
      paginated = yield paginate_results(scope: recipes, params: validated)

      Success(paginated)
    end

    private

    def find_recipes_within_budget(params:)
      budget_cents = params[:budget_cents]
      servings = params[:servings]

      scope = Recipe.includes(:category, :ingredients)

      # If servings specified, calculate cost per serving and compare
      scope = if servings
                scope.where("est_cost_cents / NULLIF(recipes.servings, 0) * ? <= ?", servings, budget_cents)
              else
                scope.within_budget(budget_cents)
              end

      # Apply category filter
      scope = scope.where(category_id: params[:category_id]) if params[:category_id]

      # Order by cost (cheapest first), then by rating
      scope = scope.order(est_cost_cents: :asc, avg_rating: :desc)

      Success(scope)
    rescue StandardError => error
      Failure(code: :search_error, message: error.message)
    end

    def paginate_results(scope:, params:)
      page = params[:page] || 1
      per_page = params[:per_page] || DEFAULT_PER_PAGE

      total = scope.count
      total_pages = (total.to_f / per_page).ceil
      offset = (page - 1) * per_page

      records = scope.limit(per_page).offset(offset)

      budget_cents = params[:budget_cents]
      servings = params[:servings]

      Success(
        recipes: records.map { |r| recipe_with_budget_data(recipe: r, budget_cents: budget_cents, servings: servings) },
        meta: {
          page: page,
          per_page: per_page,
          total: total,
          total_pages: total_pages,
          budget_cents: budget_cents,
        },
      )
    end

    def recipe_with_budget_data(recipe:, budget_cents:, servings:)
      actual_cost = if servings && recipe.servings.positive?
                      (recipe.est_cost_cents.to_f / recipe.servings * servings).round
                    else
                      recipe.est_cost_cents
                    end

      {
        recipe: recipe,
        actual_cost_cents: actual_cost,
        budget_remaining_cents: budget_cents - actual_cost,
        budget_usage_percentage: ((actual_cost.to_f / budget_cents) * 100).round(1),
      }
    end
  end
end
