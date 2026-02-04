# frozen_string_literal: true

module Ingredients
  class SearchContract < ApplicationContract
    SORT_FIELDS = ["name", "name_uk", "unit_price_cents", "created_at"].freeze

    params do
      optional(:query).maybe(:string)
      optional(:category).maybe(:string)
      optional(:sort).filled(:string, included_in?: SORT_FIELDS)
      optional(:order).filled(:string, included_in?: SORT_DIRECTIONS)
      optional(:page).filled(:integer, gt?: 0)
      optional(:per_page).filled(:integer, gt?: 0, lteq?: MAX_PER_PAGE)
    end
  end
end
