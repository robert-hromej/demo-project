# frozen_string_literal: true

module Api
  module Entities
    class IngredientEntity < Grape::Entity
      expose :id
      expose :name
      expose :name_uk
      expose :unit_price_cents
      expose :unit_price_formatted do |ingredient|
        format("%.2f UAH", ingredient.unit_price_cents / 100.0)
      end
      expose :default_unit
      expose :category
      expose :image_url
    end
  end
end
