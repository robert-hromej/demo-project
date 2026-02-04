# frozen_string_literal: true

require "rails_helper"

RSpec.describe Ingredients::Search do
  describe ".call" do
    let!(:tomato) { create(:ingredient, name: "Tomato", name_uk: "Помідор", category: "vegetables") }
    let!(:milk) { create(:ingredient, name: "Milk", name_uk: "Молоко", category: "dairy") }
    let!(:cheese) { create(:ingredient, name: "Cheese", name_uk: "Сир", category: "dairy") }

    context "without filters" do
      it "returns Success monad" do
        result = described_class.call(params: {})

        expect(result).to be_success
      end

      it "returns all ingredients" do
        result = described_class.call(params: {})
        value = result.value!

        expect(value[:ingredients].count).to eq(3)
      end

      it "returns pagination meta" do
        result = described_class.call(params: {})
        meta = result.value![:meta]

        expect(meta[:page]).to eq(1)
        expect(meta[:total]).to eq(3)
      end
    end

    context "with query filter" do
      it "searches by name" do
        result = described_class.call(params: { query: "Tom" })
        value = result.value!

        expect(value[:ingredients].count).to eq(1)
        expect(value[:ingredients].first).to eq(tomato)
      end

      it "searches by name_uk" do
        result = described_class.call(params: { query: "Помі" })
        value = result.value!

        expect(value[:ingredients].count).to eq(1)
        expect(value[:ingredients].first).to eq(tomato)
      end

      it "returns empty for no matches" do
        result = described_class.call(params: { query: "nonexistent" })
        value = result.value!

        expect(value[:ingredients]).to be_empty
      end
    end

    context "with category filter" do
      it "filters by category" do
        result = described_class.call(params: { category: "dairy" })
        value = result.value!

        expect(value[:ingredients].count).to eq(2)
        expect(value[:ingredients]).to include(milk, cheese)
        expect(value[:ingredients]).not_to include(tomato)
      end
    end

    context "with sorting" do
      it "sorts by name ascending by default" do
        result = described_class.call(params: {})
        names = result.value![:ingredients].map(&:name)

        expect(names).to eq(["Cheese", "Milk", "Tomato"])
      end

      it "sorts by name descending" do
        result = described_class.call(params: { sort: "name", order: "desc" })
        names = result.value![:ingredients].map(&:name)

        expect(names).to eq(["Tomato", "Milk", "Cheese"])
      end

      it "sorts by unit_price_cents" do
        tomato.update!(unit_price_cents: 300)
        milk.update!(unit_price_cents: 100)
        cheese.update!(unit_price_cents: 200)

        result = described_class.call(params: { sort: "unit_price_cents", order: "asc" })
        ingredients = result.value![:ingredients]

        expect(ingredients.map(&:unit_price_cents)).to eq([100, 200, 300])
      end
    end

    context "with pagination" do
      before do
        create_list(:ingredient, 25)
      end

      it "paginates results" do
        result = described_class.call(params: { page: 1, per_page: 10 })
        value = result.value!

        expect(value[:ingredients].count).to eq(10)
        expect(value[:meta][:page]).to eq(1)
        expect(value[:meta][:per_page]).to eq(10)
        expect(value[:meta][:total]).to eq(28) # 3 + 25
        expect(value[:meta][:total_pages]).to eq(3)
      end

      it "returns second page" do
        result = described_class.call(params: { page: 2, per_page: 10 })
        value = result.value!

        expect(value[:ingredients].count).to eq(10)
        expect(value[:meta][:page]).to eq(2)
      end

      it "handles page overflow" do
        result = described_class.call(params: { page: 100, per_page: 10 })
        value = result.value!

        expect(value[:ingredients]).to be_empty
      end
    end

    context "with combined filters" do
      it "applies multiple filters" do
        result = described_class.call(params: { query: "Milk", category: "dairy" })
        value = result.value!

        expect(value[:ingredients].count).to eq(1)
        expect(value[:ingredients].first).to eq(milk)
      end
    end
  end
end
