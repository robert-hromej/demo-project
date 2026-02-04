# frozen_string_literal: true

module Ingredients
  class Update < ApplicationService
    def call(ingredient:, params:)
      validated = yield validate_with_ingredient(ingredient: ingredient, params: params)
      updated = yield update_ingredient(ingredient: ingredient, params: validated)

      Success(updated)
    end

    private

    def validate_with_ingredient(ingredient:, params:)
      contract = Ingredients::UpdateContract.new(ingredient: ingredient)
      result = contract.call(params)

      if result.success?
        Success(result.to_h)
      else
        Failure(validation_error(errors: result.errors.to_h))
      end
    end

    def update_ingredient(ingredient:, params:)
      if ingredient.update(params)
        Success(ingredient)
      else
        Failure(validation_error(errors: ingredient.errors.messages))
      end
    end
  end
end
