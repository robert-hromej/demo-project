# frozen_string_literal: true

FactoryBot.define do
  factory :rating do
    association :recipe
    association :user
    score { 4 }
    review { nil }

    trait :with_review do
      review { "Great recipe! Highly recommended." }
    end

    trait :low do
      score { 2 }
    end

    trait :high do
      score { 5 }
    end
  end
end
