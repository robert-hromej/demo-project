# frozen_string_literal: true

module Ratings
  class Create < ApplicationService
    def call(recipe_id:, user:, params:)
      validated = yield validate(contract_class: Ratings::CreateContract, params: params)
      recipe = yield find_recipe(id: recipe_id)
      rating = yield create_or_update_rating(recipe: recipe, user: user, params: validated)

      Success(rating)
    end

    private

    def find_recipe(id:)
      recipe = Recipe.find_by(id: id)
      return Success(recipe) if recipe

      Failure(not_found_error(resource: "Recipe"))
    end

    def create_or_update_rating(recipe:, user:, params:)
      rating = Rating.find_or_initialize_by(recipe: recipe, user: user)
      rating.assign_attributes(
        score: params[:score],
        review: params[:review],
      )

      if rating.save
        Success(rating)
      else
        Failure(validation_error(errors: rating.errors.messages))
      end
    end
  end
end
