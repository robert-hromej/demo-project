# frozen_string_literal: true

require "rails_helper"

RSpec.describe Recipes::SearchByIngredients do
  describe ".call" do
    let!(:tomato) { create(:ingredient, name: "Tomato") }
    let!(:onion) { create(:ingredient, name: "Onion") }
    let!(:garlic) { create(:ingredient, name: "Garlic") }
    let!(:basil) { create(:ingredient, name: "Basil") }
    let!(:cheese) { create(:ingredient, name: "Cheese") }

    let!(:recipe1) do
      create(:recipe, title: "Tomato Soup", avg_rating: 4.5, est_cost_cents: 3000).tap do |r|
        create(:recipe_ingredient, recipe: r, ingredient: tomato, optional: false)
        create(:recipe_ingredient, recipe: r, ingredient: onion, optional: false)
      end
    end

    let!(:recipe2) do
      create(:recipe, title: "Pasta", avg_rating: 4.0, est_cost_cents: 5000).tap do |r|
        create(:recipe_ingredient, recipe: r, ingredient: tomato, optional: false)
        create(:recipe_ingredient, recipe: r, ingredient: garlic, optional: false)
        create(:recipe_ingredient, recipe: r, ingredient: basil, optional: true)
      end
    end

    let!(:recipe3) do
      create(:recipe, title: "Salad", avg_rating: 3.5, est_cost_cents: 2000).tap do |r|
        create(:recipe_ingredient, recipe: r, ingredient: tomato, optional: false)
        create(:recipe_ingredient, recipe: r, ingredient: onion, optional: false)
        create(:recipe_ingredient, recipe: r, ingredient: cheese, optional: false)
      end
    end

    context "with valid ingredient_ids" do
      it "returns Success monad" do
        result = described_class.call(params: { ingredient_ids: [tomato.id, onion.id] })

        expect(result).to be_success
      end

      it "finds recipes matching ingredients" do
        result = described_class.call(params: { ingredient_ids: [tomato.id, onion.id] })
        recipes = result.value![:recipes].pluck(:recipe)

        expect(recipes).to include(recipe1)
      end

      it "calculates match percentage" do
        result = described_class.call(params: { ingredient_ids: [tomato.id, onion.id] })
        recipe_data = result.value![:recipes].find { |r| r[:recipe] == recipe1 }

        expect(recipe_data[:match_percentage]).to eq(100.0)
        expect(recipe_data[:total_ingredients]).to eq(2)
        expect(recipe_data[:matched_ingredients]).to eq(2)
      end

      it "sorts by match percentage descending" do
        result = described_class.call(params: { ingredient_ids: [tomato.id, onion.id] })
        percentages = result.value![:recipes].pluck(:match_percentage)

        expect(percentages).to eq(percentages.sort.reverse)
      end
    end

    context "with match_percentage filter" do
      it "filters by minimum match percentage" do
        result = described_class.call(
          params: {
            ingredient_ids: [tomato.id, onion.id],
            match_percentage: 100,
          },
        )
        recipes = result.value![:recipes].pluck(:recipe)

        expect(recipes).to include(recipe1)
        expect(recipes.count).to eq(1)
      end

      it "returns more results with lower threshold" do
        result = described_class.call(
          params: {
            ingredient_ids: [tomato.id, onion.id],
            match_percentage: 50,
          },
        )
        recipes = result.value![:recipes]

        expect(recipes.count).to be >= 1
      end
    end

    context "with include_optional filter" do
      it "excludes optional ingredients by default" do
        # Recipe2 has 2 required + 1 optional, having tomato and garlic should give ~100%
        result = described_class.call(
          params: {
            ingredient_ids: [tomato.id, garlic.id],
            match_percentage: 80,
          },
        )
        recipes = result.value![:recipes].pluck(:recipe)

        expect(recipes).to include(recipe2)
      end

      it "includes optional ingredients when specified" do
        result = described_class.call(
          params: {
            ingredient_ids: [tomato.id, garlic.id, basil.id],
            include_optional: true,
            match_percentage: 80,
          },
        )
        recipes = result.value![:recipes].pluck(:recipe)

        expect(recipes).to include(recipe2)
      end
    end

    context "with category filter" do
      let!(:category) { create(:category) }

      before do
        recipe1.update!(category: category)
      end

      it "filters by category" do
        result = described_class.call(
          params: {
            ingredient_ids: [tomato.id, onion.id],
            category_id: category.id,
            match_percentage: 50,
          },
        )
        recipes = result.value![:recipes].pluck(:recipe)

        expect(recipes).to include(recipe1)
        expect(recipes).not_to include(recipe3)
      end
    end

    context "with max_cost filter" do
      it "filters by maximum cost" do
        result = described_class.call(
          params: {
            ingredient_ids: [tomato.id, onion.id],
            max_cost: 3000,
            match_percentage: 50,
          },
        )
        recipes = result.value![:recipes].pluck(:recipe)

        expect(recipes).to include(recipe1)
        expect(recipes).not_to include(recipe2)
      end
    end

    context "with pagination" do
      it "returns pagination meta" do
        result = described_class.call(
          params: {
            ingredient_ids: [tomato.id],
            match_percentage: 1,
          },
        )
        meta = result.value![:meta]

        expect(meta[:page]).to eq(1)
        expect(meta[:total]).to be >= 1
      end
    end

    context "with invalid params" do
      it "returns Failure for empty ingredient_ids" do
        result = described_class.call(params: { ingredient_ids: [] })

        expect(result).to be_failure
        expect(result.failure[:code]).to eq(:validation_error)
      end

      it "returns Failure for missing ingredient_ids" do
        result = described_class.call(params: {})

        expect(result).to be_failure
        expect(result.failure[:code]).to eq(:validation_error)
      end
    end
  end
end
