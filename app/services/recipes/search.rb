# frozen_string_literal: true

module Recipes
  class Search < ApplicationService
    DEFAULT_PER_PAGE = 20

    def call(params:)
      validated = yield validate(contract_class: Recipes::SearchContract, params: params)
      recipes = yield find_recipes(params: validated)
      paginated = yield paginate_results(scope: recipes, params: validated)

      Success(paginated)
    end

    private

    def find_recipes(params:)
      scope = Recipe.includes(:category, :ingredients)

      scope = apply_query_filter(scope: scope, query: params[:query])
      scope = apply_category_filter(scope: scope, category_id: params[:category_id])
      scope = apply_difficulty_filter(scope: scope, difficulty: params[:difficulty])
      scope = apply_cost_filter(scope: scope, max_cost: params[:max_cost])
      scope = apply_prep_time_filter(scope: scope, max_prep_time: params[:max_prep_time])
      scope = apply_rating_filter(scope: scope, min_rating: params[:min_rating])
      scope = apply_sorting(scope: scope, params: params)

      Success(scope)
    rescue StandardError => error
      Failure(code: :search_error, message: error.message)
    end

    def apply_query_filter(scope:, query:)
      return scope if query.blank?

      scope.where("title ILIKE :q OR description ILIKE :q", q: "%#{query}%")
    end

    def apply_category_filter(scope:, category_id:)
      return scope if category_id.blank?

      scope.where(category_id: category_id)
    end

    def apply_difficulty_filter(scope:, difficulty:)
      return scope if difficulty.blank?

      scope.by_difficulty(difficulty)
    end

    def apply_cost_filter(scope:, max_cost:)
      return scope if max_cost.blank?

      scope.within_budget(max_cost)
    end

    def apply_prep_time_filter(scope:, max_prep_time:)
      return scope if max_prep_time.blank?

      scope.where("prep_time_min + cook_time_min <= ?", max_prep_time)
    end

    def apply_rating_filter(scope:, min_rating:)
      return scope if min_rating.blank?

      scope.where(avg_rating: min_rating..)
    end

    def apply_sorting(scope:, params:)
      sort_field = params[:sort] || "rating"
      sort_order = params[:order] || "desc"

      case sort_field
      when "rating"
        scope.order(avg_rating: sort_order)
      when "cost"
        scope.order(est_cost_cents: sort_order)
      when "time"
        scope.order(Arel.sql("prep_time_min + cook_time_min #{sort_order.upcase}"))
      else
        scope.order(avg_rating: :desc)
      end
    end

    def paginate_results(scope:, params:)
      page = params[:page] || 1
      per_page = params[:per_page] || DEFAULT_PER_PAGE

      total = scope.count
      total_pages = (total.to_f / per_page).ceil
      offset = (page - 1) * per_page

      records = scope.limit(per_page).offset(offset)

      Success(
        recipes: records,
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
