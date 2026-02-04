# frozen_string_literal: true

FactoryBot.define do
  factory :recipe_ingredient do
    association :recipe
    association :ingredient
    quantity { 100 }
    unit { "g" }
    notes { nil }
    optional { false }

    trait :optional do
      optional { true }
    end

    trait :with_notes do
      notes { "finely chopped" }
    end
  end
end
