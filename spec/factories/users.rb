# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    password { "password123" }
    sequence(:name) { |n| "User #{n}" }
    avatar_url { nil }

    trait :with_avatar do
      avatar_url { "https://example.com/avatar.jpg" }
    end
  end
end
