# frozen_string_literal: true

FactoryBot.define do
  factory :ingredient do
    sequence(:name) { |n| "ingredient_#{n}" }
    sequence(:name_uk) { |n| "Інгредієнт #{n}" }
    unit_price_cents { 1000 }
    default_unit { "pcs" }
    category { "other" }

    trait :dairy do
      category { "dairy" }
      default_unit { "ml" }
    end

    trait :vegetables do
      category { "vegetables" }
      default_unit { "g" }
    end

    trait :expensive do
      unit_price_cents { 10_000 }
    end
  end
end
