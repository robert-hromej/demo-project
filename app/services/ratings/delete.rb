# frozen_string_literal: true

module Ratings
  class Delete < ApplicationService
    def call(recipe_id:, user:)
      recipe = yield find_recipe(id: recipe_id)
      rating = yield find_rating(recipe: recipe, user: user)
      yield destroy_rating(rating: rating)

      Success(true)
    end

    private

    def find_recipe(id:)
      recipe = Recipe.find_by(id: id)
      return Success(recipe) if recipe

      Failure(not_found_error(resource: "Recipe"))
    end

    def find_rating(recipe:, user:)
      rating = Rating.find_by(recipe: recipe, user: user)
      return Success(rating) if rating

      Failure(not_found_error(resource: "Rating"))
    end

    def destroy_rating(rating:)
      if rating.destroy
        Success(true)
      else
        Failure(
          code: :destroy_failed,
          message: rating.errors.full_messages.join(", "),
        )
      end
    end
  end
end
