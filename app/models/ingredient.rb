# frozen_string_literal: true

class Ingredient < ApplicationRecord
  UNITS = ["g", "kg", "ml", "l", "pcs", "tbsp", "tsp", "cup"].freeze
  CATEGORIES = ["dairy", "vegetables", "fruits", "meat", "fish", "grains", "spices", "oils", "other"].freeze

  has_many :recipe_ingredients, dependent: :restrict_with_error
  has_many :recipes, through: :recipe_ingredients

  validates :name, presence: true, uniqueness: true, length: { maximum: 100 }
  validates :name_uk, presence: true, length: { maximum: 100 }
  validates :default_unit, inclusion: { in: UNITS }
  validates :category, inclusion: { in: CATEGORIES }, allow_nil: true
  validates :unit_price_cents, numericality: { greater_than_or_equal_to: 0 }

  scope :by_category, ->(cat) { where(category: cat) }
  scope :search, ->(query) { where("name ILIKE :q OR name_uk ILIKE :q", q: "%#{query}%") }

  def unit_price
    Money.new(unit_price_cents, "UAH")
  end
end
