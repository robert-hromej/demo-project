# frozen_string_literal: true

FactoryBot.define do
  factory :category do
    sequence(:name) { |n| "Category #{n}" }
    description { "Category description" }
    position { 0 }

    trait :with_parent do
      association :parent, factory: :category
    end

    trait :with_children do
      after(:create) do |category|
        create_list(:category, 2, parent: category)
      end
    end
  end
end
