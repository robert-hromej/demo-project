# frozen_string_literal: true

class Recipe < ApplicationRecord
  enum :difficulty, { easy: 0, medium: 1, hard: 2 }, default: :easy

  belongs_to :category, optional: true, counter_cache: true
  has_many :recipe_ingredients, dependent: :destroy
  has_many :ingredients, through: :recipe_ingredients
  has_many :ratings, dependent: :destroy

  validates :title, presence: true, length: { maximum: 255 }
  validates :instructions, presence: true
  validates :prep_time_min, presence: true, numericality: { greater_than: 0 }
  validates :cook_time_min, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :servings, numericality: { greater_than: 0 }
  validates :est_cost_cents, numericality: { greater_than_or_equal_to: 0 }

  scope :published, -> { where.not(title: nil) }
  scope :by_difficulty, ->(diff) { where(difficulty: diff) }
  scope :within_budget, ->(cents) { where("est_cost_cents <= ?", cents) }
  scope :by_rating, -> { order(avg_rating: :desc) }
  scope :by_cost, -> { order(:est_cost_cents) }

  def total_time_min
    prep_time_min + cook_time_min
  end

  def cost_per_serving_cents
    return 0 if servings.zero?

    est_cost_cents / servings
  end

  def recalculate_cost!
    total = recipe_ingredients.includes(:ingredient).sum do |ri|
      ri.estimated_cost_cents
    end
    update!(est_cost_cents: total)
  end

  def recalculate_rating!
    stats = ratings.pick(Arel.sql("AVG(score) as avg, COUNT(*) as cnt"))
    update!(
      avg_rating: stats[0] || 0,
      ratings_count: stats[1] || 0
    )
  end
end
