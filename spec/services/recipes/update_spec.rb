# frozen_string_literal: true

require "rails_helper"

RSpec.describe Recipes::Update do
  describe ".call" do
    let!(:recipe) { create(:recipe, title: "Old Title", instructions: "Old instructions") }
    let!(:ingredient) { create(:ingredient, unit_price_cents: 500) }

    context "with valid params" do
      it "returns Success monad" do
        result = described_class.call(id: recipe.id, params: { title: "New Title" })

        expect(result).to be_success
      end

      it "updates the recipe title" do
        described_class.call(id: recipe.id, params: { title: "New Title" })

        expect(recipe.reload.title).to eq("New Title")
      end

      it "updates multiple attributes" do
        result = described_class.call(
          id: recipe.id,
          params: {
            title: "Updated Title",
            instructions: "Updated instructions",
            prep_time_min: 20,
            difficulty: "hard",
          },
        )

        updated = result.value!
        expect(updated.title).to eq("Updated Title")
        expect(updated.instructions).to eq("Updated instructions")
        expect(updated.prep_time_min).to eq(20)
        expect(updated.difficulty).to eq("hard")
      end

      it "returns the updated recipe" do
        result = described_class.call(id: recipe.id, params: { title: "New Title" })

        expect(result.value!).to eq(recipe.reload)
      end
    end

    context "with ingredients update" do
      before do
        create(:recipe_ingredient, recipe: recipe, ingredient: ingredient, quantity: 2, unit: "pcs")
      end

      it "replaces existing ingredients" do
        new_ingredient = create(:ingredient, unit_price_cents: 300)
        described_class.call(
          id: recipe.id,
          params: {
            ingredients: [
              { ingredient_id: new_ingredient.id, quantity: 5, unit: "g" },
            ],
          },
        )

        recipe.reload
        expect(recipe.recipe_ingredients.count).to eq(1)
        expect(recipe.ingredients).to include(new_ingredient)
        expect(recipe.ingredients).not_to include(ingredient)
      end

      it "removes all ingredients when empty array provided" do
        described_class.call(
          id: recipe.id,
          params: { ingredients: [] },
        )

        expect(recipe.reload.recipe_ingredients.count).to eq(0)
      end

      it "recalculates cost after update" do
        new_ingredient = create(:ingredient, unit_price_cents: 200)
        described_class.call(
          id: recipe.id,
          params: {
            ingredients: [
              { ingredient_id: new_ingredient.id, quantity: 10, unit: "g" },
            ],
          },
        )

        expect(recipe.reload.est_cost_cents).to eq(2000) # 10 * 200
      end
    end

    context "with non-existent recipe" do
      it "returns Failure with not_found error" do
        result = described_class.call(id: 99_999, params: { title: "Test" })

        expect(result).to be_failure
        expect(result.failure[:code]).to eq(:not_found)
        expect(result.failure[:message]).to eq("Recipe not found")
      end
    end

    context "with invalid params" do
      it "returns Failure for empty title" do
        result = described_class.call(id: recipe.id, params: { title: "" })

        expect(result).to be_failure
        expect(result.failure[:details][:title]).to be_present
      end

      it "returns Failure for invalid prep_time_min" do
        result = described_class.call(id: recipe.id, params: { prep_time_min: 0 })

        expect(result).to be_failure
        expect(result.failure[:details][:prep_time_min]).to be_present
      end

      it "returns Failure for non-existent ingredient" do
        result = described_class.call(
          id: recipe.id,
          params: {
            ingredients: [{ ingredient_id: 99_999, quantity: 1, unit: "pcs" }],
          },
        )

        expect(result).to be_failure
        expect(result.failure[:details][:ingredients]).to be_present
      end

      it "does not update recipe on failure" do
        described_class.call(id: recipe.id, params: { title: "" })

        expect(recipe.reload.title).to eq("Old Title")
      end
    end
  end
end
