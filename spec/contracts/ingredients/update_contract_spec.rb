# frozen_string_literal: true

require "rails_helper"

RSpec.describe Ingredients::UpdateContract do
  subject(:contract) { described_class.new(ingredient: ingredient) }

  let!(:ingredient) { create(:ingredient, name: "tomato", name_uk: "помідор") }

  describe "params validation" do
    context "with empty params" do
      it "passes validation (all optional)" do
        result = contract.call({})
        expect(result).to be_success
      end
    end

    context "with only name" do
      it "passes validation" do
        result = contract.call(name: "updated_tomato")
        expect(result).to be_success
      end
    end

    context "with only name_uk" do
      it "passes validation" do
        result = contract.call(name_uk: "оновлений помідор")
        expect(result).to be_success
      end
    end

    context "with name exceeding max length" do
      it "fails validation" do
        result = contract.call(name: "a" * 101)
        expect(result).to be_failure
        expect(result.errors[:name]).to be_present
      end
    end

    context "with name_uk exceeding max length" do
      it "fails validation" do
        result = contract.call(name_uk: "a" * 101)
        expect(result).to be_failure
        expect(result.errors[:name_uk]).to be_present
      end
    end
  end

  describe "default_unit validation" do
    Ingredient::UNITS.each do |unit|
      context "with valid unit '#{unit}'" do
        it "passes validation" do
          result = contract.call(default_unit: unit)
          expect(result).to be_success
        end
      end
    end

    context "with invalid unit" do
      it "fails validation" do
        result = contract.call(default_unit: "invalid")
        expect(result).to be_failure
        expect(result.errors[:default_unit]).to be_present
      end
    end
  end

  describe "category validation" do
    Ingredient::CATEGORIES.each do |cat|
      context "with valid category '#{cat}'" do
        it "passes validation" do
          result = contract.call(category: cat)
          expect(result).to be_success
        end
      end
    end

    context "with invalid category" do
      it "fails validation" do
        result = contract.call(category: "invalid")
        expect(result).to be_failure
        expect(result.errors[:category]).to be_present
      end
    end
  end

  describe "unit_price_cents validation" do
    context "with zero value" do
      it "passes validation" do
        result = contract.call(unit_price_cents: 0)
        expect(result).to be_success
      end
    end

    context "with positive value" do
      it "passes validation" do
        result = contract.call(unit_price_cents: 1000)
        expect(result).to be_success
      end
    end

    context "with negative value" do
      it "fails validation" do
        result = contract.call(unit_price_cents: -100)
        expect(result).to be_failure
        expect(result.errors[:unit_price_cents]).to be_present
      end
    end
  end

  describe "name uniqueness validation" do
    context "when updating to same name" do
      it "passes validation" do
        result = contract.call(name: "tomato")
        expect(result).to be_success
      end
    end

    context "when name already exists for another ingredient" do
      before { create(:ingredient, name: "carrot") }

      it "fails validation" do
        result = contract.call(name: "carrot")
        expect(result).to be_failure
        expect(result.errors[:name]).to be_present
      end
    end

    context "when name is unique" do
      it "passes validation" do
        result = contract.call(name: "unique_name")
        expect(result).to be_success
      end
    end
  end

  describe "without ingredient context" do
    subject(:contract_without_context) { described_class.new }

    context "when name already exists" do
      it "fails validation" do
        result = contract_without_context.call(name: "tomato")
        expect(result).to be_failure
        expect(result.errors[:name]).to be_present
      end
    end
  end
end
