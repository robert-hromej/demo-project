# frozen_string_literal: true

require "rails_helper"

RSpec.describe Ingredients::Delete do
  describe ".call" do
    let!(:ingredient) { create(:ingredient) }

    context "with no dependent recipe_ingredients" do
      it "returns Success monad" do
        result = described_class.call(ingredient: ingredient)

        expect(result).to be_success
      end

      it "deletes the ingredient" do
        expect {
          described_class.call(ingredient: ingredient)
        }.to change(Ingredient, :count).by(-1)
      end

      it "returns true on success" do
        result = described_class.call(ingredient: ingredient)

        expect(result.value!).to be(true)
      end
    end

    context "with dependent recipe_ingredients" do
      before do
        recipe = create(:recipe)
        create(:recipe_ingredient, recipe: recipe, ingredient: ingredient)
      end

      it "returns Failure monad" do
        result = described_class.call(ingredient: ingredient)

        expect(result).to be_failure
      end

      it "returns has_dependent_records error" do
        result = described_class.call(ingredient: ingredient)

        expect(result.failure[:code]).to eq(:has_dependent_records)
        expect(result.failure[:message]).to eq("Cannot delete ingredient that is used in recipes")
      end

      it "does not delete the ingredient" do
        expect {
          described_class.call(ingredient: ingredient)
        }.not_to change(Ingredient, :count)
      end
    end
  end
end
