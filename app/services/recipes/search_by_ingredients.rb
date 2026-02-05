# frozen_string_literal: true

module Recipes
  class SearchByIngredients < ApplicationService
    DEFAULT_PER_PAGE = 20
    DEFAULT_MATCH_PERCENTAGE = 80

    def call(params:)
      validated = yield validate(contract_class: Recipes::SearchByIngredientsContract, params: params)
      recipes = yield find_matching_recipes(params: validated)
      paginated = yield paginate_results(scope: recipes, params: validated)

      Success(paginated)
    end

    private

    def find_matching_recipes(params:)
      ingredient_ids = params[:ingredient_ids]
      min_match_percentage = params[:match_percentage] || DEFAULT_MATCH_PERCENTAGE
      include_optional = params[:include_optional] || false

      base_scope = Recipe
        .joins(:recipe_ingredients)
        .group("recipes.id")

      # Filter by optional ingredients
      unless include_optional
        base_scope = base_scope.where(recipe_ingredients: { optional: false })
      end

      # Calculate match percentage using sanitized SQL
      sanitized_ids = ingredient_ids.map { |id| Integer(id) }.join(",")

      matched_sql = <<~SQL.squish
        COUNT(DISTINCT CASE WHEN recipe_ingredients.ingredient_id IN (#{sanitized_ids})
        THEN recipe_ingredients.ingredient_id END) AS matched_ingredients
      SQL

      match_pct_sql = <<~SQL.squish
        ROUND(COUNT(DISTINCT CASE WHEN recipe_ingredients.ingredient_id IN (#{sanitized_ids})
        THEN recipe_ingredients.ingredient_id END)::numeric /
        COUNT(DISTINCT recipe_ingredients.ingredient_id) * 100, 2) AS match_percentage
      SQL

      min_match_sql = <<~SQL.squish
        ROUND(COUNT(DISTINCT CASE WHEN recipe_ingredients.ingredient_id IN (#{sanitized_ids})
        THEN recipe_ingredients.ingredient_id END)::numeric /
        COUNT(DISTINCT recipe_ingredients.ingredient_id) * 100, 2) >= ?
      SQL

      query = base_scope
        .select(
          "recipes.*",
          "COUNT(DISTINCT recipe_ingredients.ingredient_id) AS total_ingredients",
          matched_sql,
          match_pct_sql,
        )
        .having("COUNT(DISTINCT recipe_ingredients.ingredient_id) > 0")
        .having(min_match_sql, min_match_percentage)

      # Apply category filter
      query = query.where(category_id: params[:category_id]) if params[:category_id]

      # Apply max cost filter
      query = query.where(recipes: { est_cost_cents: ..(params[:max_cost]) }) if params[:max_cost]

      # Order by match percentage descending
      query = query.order(Arel.sql("match_percentage DESC, recipes.avg_rating DESC"))

      Success(query)
    rescue StandardError => error
      Failure(code: :search_error, message: error.message)
    end

    def paginate_results(scope:, params:)
      page = params[:page] || 1
      per_page = params[:per_page] || DEFAULT_PER_PAGE

      # For grouped queries, we need to get count differently
      total = scope.length
      total_pages = (total.to_f / per_page).ceil
      offset = (page - 1) * per_page

      records = scope.to_a.slice(offset, per_page) || []

      Success(
        recipes: records.map { |r| recipe_with_match_data(recipe: r) },
        meta: {
          page: page,
          per_page: per_page,
          total: total,
          total_pages: total_pages,
        },
      )
    end

    def recipe_with_match_data(recipe:)
      {
        recipe: recipe,
        total_ingredients: recipe.total_ingredients.to_i,
        matched_ingredients: recipe.matched_ingredients.to_i,
        match_percentage: recipe.match_percentage.to_f,
      }
    end
  end
end
