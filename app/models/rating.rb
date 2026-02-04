# frozen_string_literal: true

class Rating < ApplicationRecord
  belongs_to :recipe, counter_cache: true
  belongs_to :user

  validates :score, presence: true, inclusion: { in: 1..5 }
  validates :user_id, uniqueness: { scope: :recipe_id, message: "has already rated this recipe" }

  after_save :update_recipe_rating
  after_destroy :update_recipe_rating

  private

  def update_recipe_rating
    recipe.recalculate_rating!
  end
end
