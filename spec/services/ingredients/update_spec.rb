# frozen_string_literal: true

require "rails_helper"

RSpec.describe Ingredients::Update do
  describe ".call" do
    let!(:ingredient) { create(:ingredient, name: "Old Name", name_uk: "Стара назва") }

    context "with valid params" do
      it "returns Success monad" do
        result = described_class.call(ingredient: ingredient, params: { name: "New Name" })

        expect(result).to be_success
      end

      it "updates the ingredient name" do
        described_class.call(ingredient: ingredient, params: { name: "New Name" })

        expect(ingredient.reload.name).to eq("New Name")
      end

      it "updates the ingredient name_uk" do
        described_class.call(ingredient: ingredient, params: { name_uk: "Нова назва" })

        expect(ingredient.reload.name_uk).to eq("Нова назва")
      end

      it "updates multiple attributes" do
        result = described_class.call(
          ingredient: ingredient,
          params: {
            name: "Updated",
            name_uk: "Оновлено",
            unit_price_cents: 1000,
            category: "dairy",
          },
        )

        updated = result.value!
        expect(updated.name).to eq("Updated")
        expect(updated.name_uk).to eq("Оновлено")
        expect(updated.unit_price_cents).to eq(1000)
        expect(updated.category).to eq("dairy")
      end

      it "returns the updated ingredient" do
        result = described_class.call(ingredient: ingredient, params: { name: "New Name" })

        expect(result.value!).to eq(ingredient.reload)
      end
    end

    context "with duplicate name" do
      let!(:other_ingredient) { create(:ingredient, name: "Existing Name") }

      it "returns Failure for duplicate name" do
        result = described_class.call(ingredient: ingredient, params: { name: "Existing Name" })

        expect(result).to be_failure
        expect(result.failure[:details][:name]).to be_present
      end

      it "allows keeping the same name" do
        result = described_class.call(ingredient: ingredient, params: { name: ingredient.name })

        expect(result).to be_success
      end
    end

    context "with invalid params" do
      it "returns Failure for empty name" do
        result = described_class.call(ingredient: ingredient, params: { name: "" })

        expect(result).to be_failure
        expect(result.failure[:details][:name]).to be_present
      end

      it "returns Failure for invalid unit" do
        result = described_class.call(ingredient: ingredient, params: { default_unit: "invalid" })

        expect(result).to be_failure
        expect(result.failure[:details][:default_unit]).to be_present
      end

      it "does not update ingredient on failure" do
        described_class.call(ingredient: ingredient, params: { name: "" })

        expect(ingredient.reload.name).to eq("Old Name")
      end
    end
  end
end
