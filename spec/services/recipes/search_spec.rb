# frozen_string_literal: true

require "rails_helper"

RSpec.describe Recipes::Search do
  describe ".call" do
    let!(:category) { create(:category) }
    let!(:pasta_carbonara) do
      create(:recipe,
             title: "Pasta Carbonara",
             description: "Italian classic",
             category: category,
             difficulty: :easy,
             est_cost_cents: 5000,
             prep_time_min: 10,
             cook_time_min: 20,
             avg_rating: 4.5,)
    end
    let!(:beef_stew) do
      create(:recipe,
             title: "Beef Stew",
             description: "Hearty meal",
             difficulty: :medium,
             est_cost_cents: 15_000,
             prep_time_min: 30,
             cook_time_min: 120,
             avg_rating: 4.0,)
    end
    let!(:pasta_salad) do
      create(:recipe,
             title: "Pasta Salad",
             description: "Light and fresh",
             difficulty: :easy,
             est_cost_cents: 3000,
             prep_time_min: 15,
             cook_time_min: 0,
             avg_rating: 3.5,)
    end

    context "without filters" do
      it "returns Success monad" do
        result = described_class.call(params: {})

        expect(result).to be_success
      end

      it "returns all recipes" do
        result = described_class.call(params: {})
        value = result.value!

        expect(value[:recipes].count).to eq(3)
      end

      it "returns pagination meta" do
        result = described_class.call(params: {})
        meta = result.value![:meta]

        expect(meta[:page]).to eq(1)
        expect(meta[:total]).to eq(3)
      end

      it "sorts by rating desc by default" do
        result = described_class.call(params: {})
        ratings = result.value![:recipes].map(&:avg_rating)

        expect(ratings).to eq([4.5, 4.0, 3.5])
      end
    end

    context "with query filter" do
      it "searches by title" do
        result = described_class.call(params: { query: "Pasta" })
        value = result.value!

        expect(value[:recipes].count).to eq(2)
        expect(value[:recipes]).to include(pasta_carbonara, pasta_salad)
      end

      it "searches by description" do
        result = described_class.call(params: { query: "Italian" })
        value = result.value!

        expect(value[:recipes].count).to eq(1)
        expect(value[:recipes].first).to eq(pasta_carbonara)
      end

      it "is case insensitive" do
        result = described_class.call(params: { query: "pasta" })
        value = result.value!

        expect(value[:recipes].count).to eq(2)
      end
    end

    context "with category filter" do
      it "filters by category_id" do
        result = described_class.call(params: { category_id: category.id })
        value = result.value!

        expect(value[:recipes].count).to eq(1)
        expect(value[:recipes].first).to eq(pasta_carbonara)
      end
    end

    context "with difficulty filter" do
      it "filters by difficulty" do
        result = described_class.call(params: { difficulty: "easy" })
        value = result.value!

        expect(value[:recipes].count).to eq(2)
        expect(value[:recipes]).to include(pasta_carbonara, pasta_salad)
      end
    end

    context "with max_cost filter" do
      it "filters by max cost" do
        result = described_class.call(params: { max_cost: 5000 })
        value = result.value!

        expect(value[:recipes].count).to eq(2)
        expect(value[:recipes]).to include(pasta_carbonara, pasta_salad)
        expect(value[:recipes]).not_to include(beef_stew)
      end
    end

    context "with max_prep_time filter" do
      it "filters by total time" do
        result = described_class.call(params: { max_prep_time: 30 })
        value = result.value!

        expect(value[:recipes].count).to eq(2)
        expect(value[:recipes]).to include(pasta_carbonara, pasta_salad)
      end
    end

    context "with min_rating filter" do
      it "filters by minimum rating" do
        result = described_class.call(params: { min_rating: 4.0 })
        value = result.value!

        expect(value[:recipes].count).to eq(2)
        expect(value[:recipes]).to include(pasta_carbonara, beef_stew)
      end
    end

    context "with sorting" do
      it "sorts by cost ascending" do
        result = described_class.call(params: { sort: "cost", order: "asc" })
        costs = result.value![:recipes].map(&:est_cost_cents)

        expect(costs).to eq([3000, 5000, 15_000])
      end

      it "sorts by time" do
        result = described_class.call(params: { sort: "time", order: "asc" })
        recipes = result.value![:recipes]

        expect(recipes.map { |r| r.prep_time_min + r.cook_time_min }).to eq([15, 30, 150])
      end
    end

    context "with pagination" do
      before do
        create_list(:recipe, 25)
      end

      it "paginates results" do
        result = described_class.call(params: { page: 1, per_page: 10 })
        value = result.value!

        expect(value[:recipes].count).to eq(10)
        expect(value[:meta][:total]).to eq(28)
        expect(value[:meta][:total_pages]).to eq(3)
      end
    end

    context "with combined filters" do
      it "applies multiple filters" do
        result = described_class.call(
          params: {
            query: "Pasta",
            difficulty: "easy",
            max_cost: 4000,
          },
        )
        value = result.value!

        expect(value[:recipes].count).to eq(1)
        expect(value[:recipes].first).to eq(pasta_salad)
      end
    end
  end
end
