# frozen_string_literal: true

module Ingredients
  class Create < ApplicationService
    def call(params:)
      validated = yield validate(contract_class: Ingredients::CreateContract, params: params)
      ingredient = yield create_ingredient(params: validated)

      Success(ingredient)
    end

    private

    def create_ingredient(params:)
      ingredient = Ingredient.new(
        name: params[:name],
        name_uk: params[:name_uk],
        default_unit: params[:default_unit] || "pcs",
        unit_price_cents: params[:unit_price_cents] || 0,
        category: params[:category],
      )

      if ingredient.save
        Success(ingredient)
      else
        Failure(validation_error(errors: ingredient.errors.messages))
      end
    end
  end
end
