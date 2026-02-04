# frozen_string_literal: true

module Categories
  class Create < ApplicationService
    def call(params:)
      validated = yield validate(contract_class: Categories::CreateContract, params: params)
      category = yield create_category(params: validated)

      Success(category)
    end

    private

    def create_category(params:)
      category = Category.new(
        name: params[:name],
        description: params[:description],
        position: params[:position] || 0,
        parent_id: params[:parent_id],
      )

      if category.save
        Success(category)
      else
        Failure(validation_error(errors: category.errors.messages))
      end
    end
  end
end
