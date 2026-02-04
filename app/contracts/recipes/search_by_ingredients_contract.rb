# frozen_string_literal: true

module Recipes
  class SearchByIngredientsContract < ApplicationContract
    params do
      required(:ingredient_ids).filled(:array).each(:integer)
      optional(:match_percentage).filled(:integer, gteq?: 1, lteq?: 100)
      optional(:include_optional).filled(:bool)
      optional(:category_id).maybe(:integer)
      optional(:max_cost).maybe(:integer, gt?: 0)
      optional(:page).filled(:integer, gt?: 0)
      optional(:per_page).filled(:integer, gt?: 0, lteq?: MAX_PER_PAGE)
    end

    rule(:ingredient_ids) do
      key.failure(:at_least_one_required) if value.empty?
    end
  end
end
