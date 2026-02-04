# frozen_string_literal: true

require "rails_helper"

RSpec.describe Recipes::SearchByBudget do
  describe ".call" do
    let!(:category) { create(:category) }

    let!(:cheap_recipe) do
      create(:recipe,
             title: "Budget Pasta",
             est_cost_cents: 2000,
             servings: 4,
             avg_rating: 4.0,
             category: category,)
    end

    let!(:medium_recipe) do
      create(:recipe,
             title: "Chicken Stir-fry",
             est_cost_cents: 5000,
             servings: 2,
             avg_rating: 4.5,)
    end

    let!(:expensive_recipe) do
      create(:recipe,
             title: "Beef Wellington",
             est_cost_cents: 15_000,
             servings: 4,
             avg_rating: 5.0,)
    end

    context "with valid budget" do
      it "returns Success monad" do
        result = described_class.call(params: { budget_cents: 5000 })

        expect(result).to be_success
      end

      it "finds recipes within budget" do
        result = described_class.call(params: { budget_cents: 5000 })
        recipes = result.value![:recipes].pluck(:recipe)

        expect(recipes).to include(cheap_recipe, medium_recipe)
        expect(recipes).not_to include(expensive_recipe)
      end

      it "sorts by cost ascending" do
        result = described_class.call(params: { budget_cents: 10_000 })
        costs = result.value![:recipes].pluck(:actual_cost_cents)

        expect(costs).to eq(costs.sort)
      end

      it "includes budget data for each recipe" do
        result = described_class.call(params: { budget_cents: 5000 })
        recipe_data = result.value![:recipes].find { |r| r[:recipe] == cheap_recipe }

        expect(recipe_data[:actual_cost_cents]).to eq(2000)
        expect(recipe_data[:budget_remaining_cents]).to eq(3000)
        expect(recipe_data[:budget_usage_percentage]).to eq(40.0)
      end

      it "includes budget in meta" do
        result = described_class.call(params: { budget_cents: 5000 })

        expect(result.value![:meta][:budget_cents]).to eq(5000)
      end
    end

    context "with servings adjustment" do
      it "adjusts cost based on requested servings" do
        # Medium recipe costs 5000 for 2 servings = 2500 per serving
        # For 4 servings = 10000
        result = described_class.call(params: { budget_cents: 10_000, servings: 4 })
        recipes = result.value![:recipes].pluck(:recipe)

        expect(recipes).to include(cheap_recipe) # 2000 for 4 servings = 2000
        expect(recipes).to include(medium_recipe) # 5000 for 2 servings * 2 = 10000
        expect(recipes).not_to include(expensive_recipe) # 15000 for 4 servings
      end

      it "calculates actual cost based on servings" do
        result = described_class.call(params: { budget_cents: 20_000, servings: 2 })
        recipe_data = result.value![:recipes].find { |r| r[:recipe] == cheap_recipe }

        # Cheap recipe: 2000 cents for 4 servings = 500 per serving
        # For 2 servings = 1000 cents
        expect(recipe_data[:actual_cost_cents]).to eq(1000)
      end
    end

    context "with category filter" do
      it "filters by category" do
        result = described_class.call(
          params: {
            budget_cents: 10_000,
            category_id: category.id,
          },
        )
        recipes = result.value![:recipes].pluck(:recipe)

        expect(recipes).to include(cheap_recipe)
        expect(recipes).not_to include(medium_recipe)
      end
    end

    context "with pagination" do
      before do
        create_list(:recipe, 25, est_cost_cents: 1000)
      end

      it "paginates results" do
        result = described_class.call(params: { budget_cents: 5000, page: 1, per_page: 10 })
        value = result.value!

        expect(value[:recipes].count).to eq(10)
        expect(value[:meta][:total]).to eq(27) # 25 + 2 (cheap + medium)
        expect(value[:meta][:total_pages]).to eq(3)
      end
    end

    context "with invalid params" do
      it "returns Failure for missing budget_cents" do
        result = described_class.call(params: {})

        expect(result).to be_failure
        expect(result.failure[:code]).to eq(:validation_error)
      end

      it "returns Failure for zero budget" do
        result = described_class.call(params: { budget_cents: 0 })

        expect(result).to be_failure
        expect(result.failure[:details][:budget_cents]).to be_present
      end

      it "returns Failure for negative budget" do
        result = described_class.call(params: { budget_cents: -100 })

        expect(result).to be_failure
      end
    end

    context "with no matching recipes" do
      it "returns empty results for very low budget" do
        result = described_class.call(params: { budget_cents: 100 })
        value = result.value!

        expect(value[:recipes]).to be_empty
        expect(value[:meta][:total]).to eq(0)
      end
    end
  end
end
