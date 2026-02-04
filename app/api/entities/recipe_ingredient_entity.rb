# frozen_string_literal: true

module Api
  module Entities
    class RecipeIngredientEntity < Grape::Entity
      expose :id
      expose :quantity
      expose :unit
      expose :notes
      expose :optional
      expose :ingredient, using: IngredientEntity
      expose :estimated_cost_cents
      expose :estimated_cost_formatted do |ri|
        format("%.2f UAH", ri.estimated_cost_cents / 100.0)
      end
    end
  end
end
