# frozen_string_literal: true

module Categories
  class Update < ApplicationService
    def call(category:, params:)
      validated = yield validate(contract_class: Categories::UpdateContract, params: params)
      updated = yield update_category(category: category, params: validated)

      Success(updated)
    end

    private

    def update_category(category:, params:)
      if category.update(params)
        Success(category)
      else
        Failure(validation_error(errors: category.errors.messages))
      end
    end
  end
end
