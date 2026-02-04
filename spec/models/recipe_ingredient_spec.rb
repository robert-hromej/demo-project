# frozen_string_literal: true

require "rails_helper"

RSpec.describe RecipeIngredient do
  describe "validations" do
    subject { build(:recipe_ingredient) }

    it { is_expected.to validate_presence_of(:quantity) }
    it { is_expected.to validate_numericality_of(:quantity).is_greater_than(0) }
    it { is_expected.to validate_presence_of(:unit) }
    it { is_expected.to validate_uniqueness_of(:ingredient_id).scoped_to(:recipe_id) }
  end

  describe "associations" do
    it { is_expected.to belong_to(:recipe) }
    it { is_expected.to belong_to(:ingredient) }
  end

  describe "#estimated_cost_cents" do
    context "with valid ingredient" do
      let(:ingredient) { create(:ingredient, unit_price_cents: 100) }
      let(:recipe_ingredient) { build(:recipe_ingredient, ingredient: ingredient, quantity: 5) }

      it "calculates cost based on quantity and unit price" do
        expect(recipe_ingredient.estimated_cost_cents).to eq(500)
      end
    end

    context "with nil ingredient" do
      let(:recipe_ingredient) { build(:recipe_ingredient, ingredient: nil) }

      it "returns 0" do
        allow(recipe_ingredient).to receive(:ingredient).and_return(nil)
        expect(recipe_ingredient.estimated_cost_cents).to eq(0)
      end
    end

    context "with ingredient having nil unit_price_cents" do
      let(:ingredient) { build(:ingredient, unit_price_cents: nil) }
      let(:recipe_ingredient) { build(:recipe_ingredient, ingredient: ingredient, quantity: 5) }

      it "returns 0" do
        allow(recipe_ingredient).to receive(:ingredient).and_return(ingredient)
        expect(recipe_ingredient.estimated_cost_cents).to eq(0)
      end
    end
  end

  describe "factory" do
    it "creates a valid recipe ingredient" do
      expect(build(:recipe_ingredient)).to be_valid
    end

    it "creates an optional recipe ingredient" do
      ingredient = build(:recipe_ingredient, :optional)
      expect(ingredient.optional).to be true
    end

    it "creates a recipe ingredient with notes" do
      ingredient = build(:recipe_ingredient, :with_notes)
      expect(ingredient.notes).to eq("finely chopped")
    end
  end

  describe "uniqueness constraint" do
    let(:recipe) { create(:recipe) }
    let(:ingredient) { create(:ingredient) }

    before do
      create(:recipe_ingredient, recipe: recipe, ingredient: ingredient)
    end

    it "prevents duplicate ingredient in same recipe" do
      duplicate = build(:recipe_ingredient, recipe: recipe, ingredient: ingredient)
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:ingredient_id]).to include("has already been taken")
    end

    it "allows same ingredient in different recipes" do
      other_recipe = create(:recipe)
      new_ingredient = build(:recipe_ingredient, recipe: other_recipe, ingredient: ingredient)
      expect(new_ingredient).to be_valid
    end
  end
end
