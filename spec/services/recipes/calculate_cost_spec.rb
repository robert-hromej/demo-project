# frozen_string_literal: true

require "rails_helper"

RSpec.describe Recipes::CalculateCost do
  describe ".call" do
    let!(:recipe) { create(:recipe, est_cost_cents: 0) }
    let!(:ingredient1) { create(:ingredient, unit_price_cents: 500) }
    let!(:ingredient2) { create(:ingredient, unit_price_cents: 1000) }

    context "with recipe ingredients" do
      before do
        create(:recipe_ingredient, recipe: recipe, ingredient: ingredient1, quantity: 2)
        create(:recipe_ingredient, recipe: recipe, ingredient: ingredient2, quantity: 3)
      end

      it "returns Success monad" do
        result = described_class.call(recipe: recipe)

        expect(result).to be_success
      end

      it "calculates total cost correctly" do
        described_class.call(recipe: recipe)

        # (2 * 500) + (3 * 1000) = 1000 + 3000 = 4000
        expect(recipe.reload.est_cost_cents).to eq(4000)
      end

      it "returns the updated recipe" do
        result = described_class.call(recipe: recipe)

        expect(result.value!).to eq(recipe.reload)
        expect(result.value!.est_cost_cents).to eq(4000)
      end
    end

    context "without recipe ingredients" do
      it "sets cost to zero" do
        recipe.update!(est_cost_cents: 5000)
        described_class.call(recipe: recipe)

        expect(recipe.reload.est_cost_cents).to eq(0)
      end
    end

    context "with zero price ingredients" do
      before do
        ingredient1.update!(unit_price_cents: 0)
        create(:recipe_ingredient, recipe: recipe, ingredient: ingredient1, quantity: 5)
      end

      it "handles zero price correctly" do
        described_class.call(recipe: recipe)

        expect(recipe.reload.est_cost_cents).to eq(0)
      end
    end

    context "with decimal quantities" do
      before do
        create(:recipe_ingredient, recipe: recipe, ingredient: ingredient1, quantity: 2.5)
      end

      it "calculates cost with decimal quantity" do
        described_class.call(recipe: recipe)

        # 2.5 * 500 = 1250
        expect(recipe.reload.est_cost_cents).to eq(1250)
      end
    end
  end
end
