# frozen_string_literal: true

module Ingredients
  class CreateContract < ApplicationContract
    params do
      required(:name).filled(:string, max_size?: 100)
      required(:name_uk).filled(:string, max_size?: 100)
      optional(:default_unit).maybe(:string, included_in?: Ingredient::UNITS)
      optional(:category).maybe(:string, included_in?: Ingredient::CATEGORIES)
      optional(:unit_price_cents).maybe(:integer, gteq?: 0)
    end

    rule(:name) do
      key.failure(:already_taken) if Ingredient.exists?(name: value)
    end
  end
end
