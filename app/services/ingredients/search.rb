# frozen_string_literal: true

module Ingredients
  class Search < ApplicationService
    DEFAULT_PER_PAGE = 20

    def call(params:)
      validated = yield validate(contract_class: Ingredients::SearchContract, params: params)
      ingredients = yield find_ingredients(params: validated)
      paginated = yield paginate_results(scope: ingredients, params: validated)

      Success(paginated)
    end

    private

    def find_ingredients(params:)
      scope = Ingredient.all

      scope = apply_query_filter(scope: scope, query: params[:query])
      scope = apply_category_filter(scope: scope, category: params[:category])
      scope = apply_sorting(scope: scope, params: params)

      Success(scope)
    rescue StandardError => error
      Failure(code: :search_error, message: error.message)
    end

    def apply_query_filter(scope:, query:)
      return scope if query.blank?

      scope.search(query)
    end

    def apply_category_filter(scope:, category:)
      return scope if category.blank?

      scope.by_category(category)
    end

    def apply_sorting(scope:, params:)
      sort_field = params[:sort] || "name"
      sort_order = params[:order] || "asc"

      scope.order(sort_field => sort_order)
    end

    def paginate_results(scope:, params:)
      page = params[:page] || 1
      per_page = params[:per_page] || DEFAULT_PER_PAGE

      total = scope.count
      total_pages = (total.to_f / per_page).ceil
      offset = (page - 1) * per_page

      records = scope.limit(per_page).offset(offset)

      Success(
        ingredients: records,
        meta: {
          page: page,
          per_page: per_page,
          total: total,
          total_pages: total_pages,
        },
      )
    end
  end
end
