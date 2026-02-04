# frozen_string_literal: true

require "rails_helper"

RSpec.describe Recipes::Create do
  describe ".call" do
    let!(:category) { create(:category) }
    let!(:ingredient) { create(:ingredient, unit_price_cents: 500) }

    let(:valid_params) do
      {
        title: "Delicious Omelette",
        instructions: "Mix eggs with milk. Cook in pan.",
        prep_time_min: 5,
        cook_time_min: 10,
      }
    end

    context "with valid params" do
      it "returns Success monad" do
        result = described_class.call(params: valid_params)

        expect(result).to be_success
      end

      it "creates a new recipe" do
        expect {
          described_class.call(params: valid_params)
        }.to change(Recipe, :count).by(1)
      end

      it "returns the created recipe" do
        result = described_class.call(params: valid_params)
        recipe = result.value!

        expect(recipe).to be_a(Recipe)
        expect(recipe.title).to eq("Delicious Omelette")
        expect(recipe.instructions).to eq("Mix eggs with milk. Cook in pan.")
        expect(recipe.prep_time_min).to eq(5)
        expect(recipe.cook_time_min).to eq(10)
      end

      it "sets default values" do
        result = described_class.call(params: valid_params)
        recipe = result.value!

        expect(recipe.servings).to eq(4)
        expect(recipe.difficulty).to eq("easy")
      end

      it "accepts optional parameters" do
        result = described_class.call(
          params: valid_params.merge(
            description: "A tasty breakfast",
            category_id: category.id,
            servings: 2,
            difficulty: "medium",
          ),
        )

        recipe = result.value!
        expect(recipe.description).to eq("A tasty breakfast")
        expect(recipe.category).to eq(category)
        expect(recipe.servings).to eq(2)
        expect(recipe.difficulty).to eq("medium")
      end
    end

    context "with ingredients" do
      let(:params_with_ingredients) do
        valid_params.merge(
          ingredients: [
            { ingredient_id: ingredient.id, quantity: 3, unit: "pcs" },
          ],
        )
      end

      it "creates recipe with ingredients" do
        result = described_class.call(params: params_with_ingredients)
        recipe = result.value!

        expect(recipe.recipe_ingredients.count).to eq(1)
        expect(recipe.ingredients).to include(ingredient)
      end

      it "creates recipe_ingredients with correct attributes" do
        result = described_class.call(params: params_with_ingredients)
        recipe = result.value!
        ri = recipe.recipe_ingredients.first

        expect(ri.quantity).to eq(3)
        expect(ri.unit).to eq("pcs")
      end

      it "calculates estimated cost" do
        result = described_class.call(params: params_with_ingredients)
        recipe = result.value!

        expect(recipe.est_cost_cents).to eq(1500) # 3 * 500
      end

      it "returns Failure for non-existent ingredient" do
        invalid_params = valid_params.merge(
          ingredients: [{ ingredient_id: 99_999, quantity: 1, unit: "pcs" }],
        )
        result = described_class.call(params: invalid_params)

        expect(result).to be_failure
        expect(result.failure[:details][:ingredients]).to be_present
      end
    end

    context "with invalid params" do
      it "returns Failure for missing title" do
        result = described_class.call(params: valid_params.except(:title))

        expect(result).to be_failure
        expect(result.failure[:code]).to eq(:validation_error)
        expect(result.failure[:details][:title]).to be_present
      end

      it "returns Failure for missing instructions" do
        result = described_class.call(params: valid_params.except(:instructions))

        expect(result).to be_failure
        expect(result.failure[:details][:instructions]).to be_present
      end

      it "returns Failure for invalid prep_time_min" do
        result = described_class.call(params: valid_params.merge(prep_time_min: 0))

        expect(result).to be_failure
        expect(result.failure[:details][:prep_time_min]).to be_present
      end

      it "returns Failure for non-existent category" do
        result = described_class.call(params: valid_params.merge(category_id: 99_999))

        expect(result).to be_failure
        expect(result.failure[:details][:category_id]).to be_present
      end

      it "returns Failure for invalid difficulty" do
        result = described_class.call(params: valid_params.merge(difficulty: "extreme"))

        expect(result).to be_failure
        expect(result.failure[:details][:difficulty]).to be_present
      end

      it "does not create recipe on failure" do
        expect {
          described_class.call(params: valid_params.except(:title))
        }.not_to change(Recipe, :count)
      end
    end
  end
end
