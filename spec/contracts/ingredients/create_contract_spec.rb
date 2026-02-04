# frozen_string_literal: true

require "rails_helper"

RSpec.describe Ingredients::CreateContract do
  subject(:contract) { described_class.new }

  let(:valid_params) do
    {
      name: "tomato",
      name_uk: "помідор",
    }
  end

  describe "params validation" do
    context "with valid params" do
      it "passes validation" do
        result = contract.call(valid_params)
        expect(result).to be_success
      end
    end

    context "with all optional params" do
      it "passes validation" do
        result = contract.call(
          valid_params.merge(
            default_unit: "kg",
            category: "vegetables",
            unit_price_cents: 5000,
          ),
        )
        expect(result).to be_success
      end
    end

    context "without name" do
      it "fails with missing name" do
        result = contract.call(valid_params.except(:name))
        expect(result).to be_failure
        expect(result.errors[:name]).to include("is missing")
      end
    end

    context "without name_uk" do
      it "fails with missing name_uk" do
        result = contract.call(valid_params.except(:name_uk))
        expect(result).to be_failure
        expect(result.errors[:name_uk]).to include("is missing")
      end
    end

    context "with name exceeding max length" do
      it "fails validation" do
        result = contract.call(valid_params.merge(name: "a" * 101))
        expect(result).to be_failure
        expect(result.errors[:name]).to be_present
      end
    end

    context "with name_uk exceeding max length" do
      it "fails validation" do
        result = contract.call(valid_params.merge(name_uk: "a" * 101))
        expect(result).to be_failure
        expect(result.errors[:name_uk]).to be_present
      end
    end
  end

  describe "default_unit validation" do
    Ingredient::UNITS.each do |unit|
      context "with valid unit '#{unit}'" do
        it "passes validation" do
          result = contract.call(valid_params.merge(default_unit: unit))
          expect(result).to be_success
        end
      end
    end

    context "with invalid unit" do
      it "fails validation" do
        result = contract.call(valid_params.merge(default_unit: "invalid"))
        expect(result).to be_failure
        expect(result.errors[:default_unit]).to be_present
      end
    end
  end

  describe "category validation" do
    Ingredient::CATEGORIES.each do |cat|
      context "with valid category '#{cat}'" do
        it "passes validation" do
          result = contract.call(valid_params.merge(category: cat))
          expect(result).to be_success
        end
      end
    end

    context "with invalid category" do
      it "fails validation" do
        result = contract.call(valid_params.merge(category: "invalid"))
        expect(result).to be_failure
        expect(result.errors[:category]).to be_present
      end
    end
  end

  describe "unit_price_cents validation" do
    context "with zero value" do
      it "passes validation" do
        result = contract.call(valid_params.merge(unit_price_cents: 0))
        expect(result).to be_success
      end
    end

    context "with positive value" do
      it "passes validation" do
        result = contract.call(valid_params.merge(unit_price_cents: 1000))
        expect(result).to be_success
      end
    end

    context "with negative value" do
      it "fails validation" do
        result = contract.call(valid_params.merge(unit_price_cents: -100))
        expect(result).to be_failure
        expect(result.errors[:unit_price_cents]).to be_present
      end
    end
  end

  describe "name uniqueness validation" do
    context "when name already exists" do
      before { create(:ingredient, name: "tomato") }

      it "fails validation" do
        result = contract.call(valid_params)
        expect(result).to be_failure
        expect(result.errors[:name]).to be_present
      end
    end

    context "when name is unique" do
      it "passes validation" do
        result = contract.call(valid_params.merge(name: "unique_ingredient"))
        expect(result).to be_success
      end
    end
  end
end
