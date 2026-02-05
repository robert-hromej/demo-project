# frozen_string_literal: true

module Recipes
  class SearchContract < ApplicationContract
    DIFFICULTIES = ["easy", "medium", "hard"].freeze
    SORT_FIELDS = ["rating", "cost", "time", "created_at"].freeze

    params do
      optional(:query).maybe(:string)
      optional(:category_id).maybe(:integer)
      optional(:difficulty).filled(:string, included_in?: DIFFICULTIES)
      optional(:max_cost).maybe(:integer, gt?: 0)
      optional(:max_prep_time).maybe(:integer, gt?: 0)
      optional(:min_rating).maybe(:decimal, gteq?: 0, lteq?: 5)
      optional(:sort).filled(:string, included_in?: SORT_FIELDS)
      optional(:order).filled(:string, included_in?: SORT_DIRECTIONS)
      optional(:page).filled(:integer, gt?: 0)
      optional(:per_page).filled(:integer, gt?: 0, lteq?: MAX_PER_PAGE)
    end
  end
end
