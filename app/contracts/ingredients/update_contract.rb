# frozen_string_literal: true

module Ingredients
  class UpdateContract < ApplicationContract
    option :ingredient, default: proc {}

    params do
      optional(:name).filled(:string, max_size?: 100)
      optional(:name_uk).filled(:string, max_size?: 100)
      optional(:default_unit).maybe(:string, included_in?: Ingredient::UNITS)
      optional(:category).maybe(:string, included_in?: Ingredient::CATEGORIES)
      optional(:unit_price_cents).maybe(:integer, gteq?: 0)
    end

    rule(:name) do
      if value
        existing = Ingredient.find_by(name: value)
        key.failure(:already_taken) if existing && existing != ingredient
      end
    end
  end
end
