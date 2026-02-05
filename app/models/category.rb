# frozen_string_literal: true

class Category < ApplicationRecord
  has_ancestry

  has_many :recipes, dependent: :nullify

  validates :name, presence: true, length: { maximum: 100 }

  scope :ordered, -> { order(:position) }
  scope :roots, -> { where(ancestry: nil) }
end
