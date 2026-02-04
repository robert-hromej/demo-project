# frozen_string_literal: true

module Recipes
  class UpdateContract < ApplicationContract
    DIFFICULTIES = ["easy", "medium", "hard"].freeze

    params do
      optional(:title).filled(:string, max_size?: 255)
      optional(:description).maybe(:string)
      optional(:instructions).filled(:string)
      optional(:category_id).maybe(:integer)
      optional(:prep_time_min).filled(:integer, gt?: 0)
      optional(:cook_time_min).filled(:integer, gteq?: 0)
      optional(:servings).filled(:integer, gt?: 0)
      optional(:difficulty).filled(:string, included_in?: DIFFICULTIES)
      optional(:ingredients).array(:hash) do
        required(:ingredient_id).filled(:integer)
        required(:quantity).filled(:decimal, gt?: 0)
        required(:unit).filled(:string)
        optional(:notes).maybe(:string)
        optional(:optional).filled(:bool)
      end
    end

    rule(:category_id) do
      key.failure(:not_found) if value && !Category.exists?(value)
    end

    rule(:ingredients) do
      if value
        ingredient_ids = value.pluck(:ingredient_id)
        existing_ids = Ingredient.where(id: ingredient_ids).pluck(:id)
        missing = ingredient_ids - existing_ids
        key.failure(:ingredients_not_found, missing: missing) if missing.any?
      end
    end
  end
end
