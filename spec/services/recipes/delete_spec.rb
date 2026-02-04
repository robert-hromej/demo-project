# frozen_string_literal: true

require "rails_helper"

RSpec.describe Recipes::Delete do
  describe ".call" do
    let!(:recipe) { create(:recipe) }

    context "with existing recipe" do
      it "returns Success monad" do
        result = described_class.call(id: recipe.id)

        expect(result).to be_success
      end

      it "deletes the recipe" do
        expect {
          described_class.call(id: recipe.id)
        }.to change(Recipe, :count).by(-1)
      end

      it "returns true on success" do
        result = described_class.call(id: recipe.id)

        expect(result.value!).to be(true)
      end

      it "deletes associated recipe_ingredients" do
        create(:recipe_ingredient, recipe: recipe)

        expect {
          described_class.call(id: recipe.id)
        }.to change(RecipeIngredient, :count).by(-1)
      end

      it "deletes associated ratings" do
        create(:rating, recipe: recipe)

        expect {
          described_class.call(id: recipe.id)
        }.to change(Rating, :count).by(-1)
      end
    end

    context "with non-existent recipe" do
      it "returns Failure with not_found error" do
        result = described_class.call(id: 99_999)

        expect(result).to be_failure
        expect(result.failure[:code]).to eq(:not_found)
        expect(result.failure[:message]).to eq("Recipe not found")
      end
    end
  end
end
