# frozen_string_literal: true

require "rails_helper"

RSpec.describe Ingredients::Create do
  describe ".call" do
    let(:valid_params) do
      {
        name: "Tomato",
        name_uk: "Помідор",
        default_unit: "pcs",
        unit_price_cents: 500,
        category: "vegetables",
      }
    end

    context "with valid params" do
      it "returns Success monad" do
        result = described_class.call(params: valid_params)

        expect(result).to be_success
      end

      it "creates a new ingredient" do
        expect {
          described_class.call(params: valid_params)
        }.to change(Ingredient, :count).by(1)
      end

      it "returns the created ingredient" do
        result = described_class.call(params: valid_params)
        ingredient = result.value!

        expect(ingredient).to be_a(Ingredient)
        expect(ingredient.name).to eq("Tomato")
        expect(ingredient.name_uk).to eq("Помідор")
        expect(ingredient.default_unit).to eq("pcs")
        expect(ingredient.unit_price_cents).to eq(500)
        expect(ingredient.category).to eq("vegetables")
      end

      it "sets default values when not provided" do
        result = described_class.call(params: valid_params.except(:unit_price_cents, :default_unit))

        ingredient = result.value!
        expect(ingredient.unit_price_cents).to eq(0)
        expect(ingredient.default_unit).to eq("pcs")
      end
    end

    context "with invalid params" do
      it "returns Failure for missing name" do
        result = described_class.call(params: valid_params.except(:name))

        expect(result).to be_failure
        expect(result.failure[:code]).to eq(:validation_error)
        expect(result.failure[:details][:name]).to be_present
      end

      it "returns Failure for missing name_uk" do
        result = described_class.call(params: valid_params.except(:name_uk))

        expect(result).to be_failure
        expect(result.failure[:details][:name_uk]).to be_present
      end

      it "returns Failure for duplicate name" do
        create(:ingredient, name: "Tomato")
        result = described_class.call(params: valid_params)

        expect(result).to be_failure
        expect(result.failure[:details][:name]).to be_present
      end

      it "returns Failure for invalid unit" do
        result = described_class.call(params: valid_params.merge(default_unit: "invalid"))

        expect(result).to be_failure
        expect(result.failure[:details][:default_unit]).to be_present
      end

      it "returns Failure for invalid category" do
        result = described_class.call(params: valid_params.merge(category: "invalid"))

        expect(result).to be_failure
        expect(result.failure[:details][:category]).to be_present
      end

      it "does not create ingredient on failure" do
        expect {
          described_class.call(params: valid_params.except(:name))
        }.not_to change(Ingredient, :count)
      end
    end
  end
end
