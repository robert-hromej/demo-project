# frozen_string_literal: true

FactoryBot.define do
  factory :recipe do
    sequence(:title) { |n| "Recipe #{n}" }
    description { "Delicious recipe" }
    instructions { "Step 1: Cook. Step 2: Eat." }
    prep_time_min { 15 }
    cook_time_min { 30 }
    servings { 4 }
    difficulty { :easy }
    est_cost_cents { 5000 }

    trait :with_category do
      association :category
    end

    trait :medium do
      difficulty { :medium }
    end

    trait :hard do
      difficulty { :hard }
    end

    trait :cheap do
      est_cost_cents { 2000 }
    end

    trait :expensive do
      est_cost_cents { 20_000 }
    end

    trait :with_ingredients do
      transient do
        ingredients_count { 3 }
      end

      after(:create) do |recipe, evaluator|
        create_list(:recipe_ingredient, evaluator.ingredients_count, recipe: recipe)
      end
    end

    trait :with_ratings do
      transient do
        ratings_count { 3 }
        rating_score { 4 }
      end

      after(:create) do |recipe, evaluator|
        evaluator.ratings_count.times do
          create(:rating, recipe: recipe, score: evaluator.rating_score)
        end
      end
    end
  end
end
