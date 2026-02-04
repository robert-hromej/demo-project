# frozen_string_literal: true

class User < ApplicationRecord
  has_secure_password

  has_many :ratings, dependent: :destroy
  has_many :rated_recipes, through: :ratings, source: :recipe

  validates :email, presence: true,
                    uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :name, presence: true, length: { maximum: 100 }
  validates :password, length: { minimum: 8 }, if: -> { new_record? || password.present? }

  normalizes :email, with: ->(email) { email.strip.downcase }
end
