# frozen_string_literal: true

module Recipes
  class SearchByBudgetContract < ApplicationContract
    params do
      required(:budget_cents).filled(:integer, gt?: 0)
      optional(:servings).filled(:integer, gt?: 0)
      optional(:category_id).maybe(:integer)
      optional(:page).filled(:integer, gt?: 0)
      optional(:per_page).filled(:integer, gt?: 0, lteq?: MAX_PER_PAGE)
    end
  end
end
