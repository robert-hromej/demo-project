# frozen_string_literal: true

require "rails_helper"

RSpec.describe Ingredient do
  describe "constants" do
    it "defines valid units" do
      expect(described_class::UNITS).to eq(
        ["g", "kg", "ml", "l", "pcs", "tbsp", "tsp", "cup"],
      )
    end

    it "defines valid categories" do
      expect(described_class::CATEGORIES).to eq(
        ["dairy", "vegetables", "fruits", "meat", "fish", "grains", "spices", "oils", "other"],
      )
    end
  end

  describe "validations" do
    subject { build(:ingredient) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:name) }
    it { is_expected.to validate_length_of(:name).is_at_most(100) }
    it { is_expected.to validate_presence_of(:name_uk) }
    it { is_expected.to validate_length_of(:name_uk).is_at_most(100) }
    it { is_expected.to validate_inclusion_of(:default_unit).in_array(described_class::UNITS) }
    it { is_expected.to validate_inclusion_of(:category).in_array(described_class::CATEGORIES).allow_nil }
    it { is_expected.to validate_numericality_of(:unit_price_cents).is_greater_than_or_equal_to(0) }
  end

  describe "associations" do
    it { is_expected.to have_many(:recipe_ingredients).dependent(:restrict_with_error) }
    it { is_expected.to have_many(:recipes).through(:recipe_ingredients) }
  end

  describe "scopes" do
    describe ".by_category" do
      let!(:dairy_ingredient) { create(:ingredient, :dairy) }
      let!(:vegetable_ingredient) { create(:ingredient, :vegetables) }

      it "filters by category" do
        expect(described_class.by_category("dairy")).to include(dairy_ingredient)
        expect(described_class.by_category("dairy")).not_to include(vegetable_ingredient)
      end
    end

    describe ".search" do
      let!(:milk) { create(:ingredient, name: "milk", name_uk: "Молоко") }
      let!(:butter) { create(:ingredient, name: "butter", name_uk: "Масло") }

      it "searches by name (English)" do
        expect(described_class.search("milk")).to include(milk)
        expect(described_class.search("milk")).not_to include(butter)
      end

      it "searches by name (Ukrainian)" do
        expect(described_class.search("Молоко")).to include(milk)
        expect(described_class.search("Молоко")).not_to include(butter)
      end

      it "performs case-insensitive search" do
        expect(described_class.search("MILK")).to include(milk)
      end

      it "performs partial match search" do
        expect(described_class.search("mil")).to include(milk)
      end
    end
  end

  describe "#unit_price" do
    let(:ingredient) { build(:ingredient, unit_price_cents: 1500) }

    it "returns Money object in UAH" do
      expect(ingredient.unit_price).to eq(Money.new(1500, "UAH"))
    end
  end

  describe "factory" do
    it "creates a valid ingredient" do
      expect(build(:ingredient)).to be_valid
    end

    it "creates a valid dairy ingredient" do
      ingredient = build(:ingredient, :dairy)
      expect(ingredient).to be_valid
      expect(ingredient.category).to eq("dairy")
      expect(ingredient.default_unit).to eq("ml")
    end

    it "creates a valid vegetable ingredient" do
      ingredient = build(:ingredient, :vegetables)
      expect(ingredient).to be_valid
      expect(ingredient.category).to eq("vegetables")
      expect(ingredient.default_unit).to eq("g")
    end

    it "creates an expensive ingredient" do
      ingredient = build(:ingredient, :expensive)
      expect(ingredient.unit_price_cents).to eq(10_000)
    end
  end
end
