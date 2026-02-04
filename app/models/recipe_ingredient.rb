# frozen_string_literal: true

class RecipeIngredient < ApplicationRecord
  belongs_to :recipe
  belongs_to :ingredient

  validates :quantity, presence: true, numericality: { greater_than: 0 }
  validates :unit, presence: true
  validates :ingredient_id, uniqueness: { scope: :recipe_id }

  def estimated_cost_cents
    return 0 unless ingredient&.unit_price_cents

    # Simplified calculation - real would need unit conversion
    (quantity * ingredient.unit_price_cents).to_i
  end
end
