# frozen_string_literal: true

module Categories
  class Delete < ApplicationService
    def call(category:)
      yield check_no_recipes(category: category)
      yield destroy_category(category: category)

      Success(true)
    end

    private

    def check_no_recipes(category:)
      if category.recipes.exists?
        Failure(
          code: :has_dependent_records,
          message: "Cannot delete category with recipes",
        )
      else
        Success(true)
      end
    end

    def destroy_category(category:)
      if category.destroy
        Success(true)
      else
        Failure(
          code: :destroy_failed,
          message: category.errors.full_messages.join(", "),
        )
      end
    end
  end
end
