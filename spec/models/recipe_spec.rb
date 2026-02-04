# frozen_string_literal: true

require "rails_helper"

RSpec.describe Recipe do
  describe "enum" do
    it { is_expected.to define_enum_for(:difficulty).with_values(easy: 0, medium: 1, hard: 2).with_default(:easy) }
  end

  describe "validations" do
    subject { build(:recipe) }

    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to validate_length_of(:title).is_at_most(255) }
    it { is_expected.to validate_presence_of(:instructions) }
    it { is_expected.to validate_presence_of(:prep_time_min) }
    it { is_expected.to validate_numericality_of(:prep_time_min).is_greater_than(0) }
    it { is_expected.to validate_presence_of(:cook_time_min) }
    it { is_expected.to validate_numericality_of(:cook_time_min).is_greater_than_or_equal_to(0) }
    it { is_expected.to validate_numericality_of(:servings).is_greater_than(0) }
    it { is_expected.to validate_numericality_of(:est_cost_cents).is_greater_than_or_equal_to(0) }
  end

  describe "associations" do
    it { is_expected.to belong_to(:category).optional }
    it { is_expected.to have_many(:recipe_ingredients).dependent(:destroy) }
    it { is_expected.to have_many(:ingredients).through(:recipe_ingredients) }
    it { is_expected.to have_many(:ratings).dependent(:destroy) }
  end

  describe "scopes" do
    describe ".published" do
      let!(:published_recipe) { create(:recipe, title: "Published Recipe") }

      it "returns recipes with title" do
        expect(described_class.published).to include(published_recipe)
      end
    end

    describe ".by_difficulty" do
      let!(:easy_recipe) { create(:recipe, difficulty: :easy) }
      let!(:medium_recipe) { create(:recipe, difficulty: :medium) }
      let!(:hard_recipe) { create(:recipe, difficulty: :hard) }

      it "filters by easy difficulty" do
        expect(described_class.by_difficulty(:easy)).to include(easy_recipe)
        expect(described_class.by_difficulty(:easy)).not_to include(medium_recipe, hard_recipe)
      end

      it "filters by medium difficulty" do
        expect(described_class.by_difficulty(:medium)).to include(medium_recipe)
      end

      it "filters by hard difficulty" do
        expect(described_class.by_difficulty(:hard)).to include(hard_recipe)
      end
    end

    describe ".within_budget" do
      let!(:cheap_recipe) { create(:recipe, :cheap) }
      let!(:expensive_recipe) { create(:recipe, :expensive) }

      it "returns recipes within budget" do
        expect(described_class.within_budget(3000)).to include(cheap_recipe)
        expect(described_class.within_budget(3000)).not_to include(expensive_recipe)
      end
    end

    describe ".by_rating" do
      let!(:low_rated) { create(:recipe, avg_rating: 2.0) }
      let!(:high_rated) { create(:recipe, avg_rating: 5.0) }

      it "orders by average rating descending" do
        expect(described_class.by_rating.first).to eq(high_rated)
      end
    end

    describe ".by_cost" do
      let!(:expensive_recipe) { create(:recipe, :expensive) }
      let!(:cheap_recipe) { create(:recipe, :cheap) }

      it "orders by cost ascending" do
        expect(described_class.by_cost.first).to eq(cheap_recipe)
      end
    end
  end

  describe "#total_time_min" do
    let(:recipe) { build(:recipe, prep_time_min: 15, cook_time_min: 30) }

    it "returns sum of prep and cook time" do
      expect(recipe.total_time_min).to eq(45)
    end
  end

  describe "#cost_per_serving_cents" do
    context "with valid servings" do
      let(:recipe) { build(:recipe, est_cost_cents: 10_000, servings: 4) }

      it "calculates cost per serving" do
        expect(recipe.cost_per_serving_cents).to eq(2500)
      end
    end

    context "with zero servings" do
      let(:recipe) { build(:recipe, est_cost_cents: 10_000, servings: 0) }

      it "returns 0 to avoid division by zero" do
        expect(recipe.cost_per_serving_cents).to eq(0)
      end
    end
  end

  describe "#recalculate_cost!" do
    let(:recipe) { create(:recipe, est_cost_cents: 0) }
    let(:first_ingredient) { create(:ingredient, unit_price_cents: 100) }
    let(:second_ingredient) { create(:ingredient, unit_price_cents: 200) }

    before do
      create(:recipe_ingredient, recipe: recipe, ingredient: first_ingredient, quantity: 2)
      create(:recipe_ingredient, recipe: recipe, ingredient: second_ingredient, quantity: 3)
    end

    it "recalculates estimated cost from ingredients" do
      recipe.recalculate_cost!
      # 2 * 100 + 3 * 200 = 200 + 600 = 800
      expect(recipe.est_cost_cents).to eq(800)
    end
  end

  describe "#recalculate_rating!" do
    let(:recipe) { create(:recipe) }
    let(:first_user) { create(:user) }
    let(:second_user) { create(:user) }
    let(:third_user) { create(:user) }

    before do
      # Bypass callback to set up test data
      Rating.skip_callback(:save, :after, :update_recipe_rating)
      Rating.skip_callback(:destroy, :after, :update_recipe_rating)
      create(:rating, recipe: recipe, user: first_user, score: 3)
      create(:rating, recipe: recipe, user: second_user, score: 4)
      create(:rating, recipe: recipe, user: third_user, score: 5)
      Rating.set_callback(:save, :after, :update_recipe_rating)
      Rating.set_callback(:destroy, :after, :update_recipe_rating)
    end

    it "calculates average rating and count" do
      recipe.recalculate_rating!
      expect(recipe.avg_rating).to eq(4.0)
      expect(recipe.ratings_count).to eq(3)
    end
  end

  describe "factory" do
    it "creates a valid recipe" do
      expect(build(:recipe)).to be_valid
    end

    it "creates a valid recipe with category" do
      recipe = create(:recipe, :with_category)
      expect(recipe).to be_valid
      expect(recipe.category).to be_present
    end

    it "creates recipes with different difficulties" do
      expect(build(:recipe, :medium).difficulty).to eq("medium")
      expect(build(:recipe, :hard).difficulty).to eq("hard")
    end

    it "creates cheap recipe" do
      expect(build(:recipe, :cheap).est_cost_cents).to eq(2000)
    end

    it "creates expensive recipe" do
      expect(build(:recipe, :expensive).est_cost_cents).to eq(20_000)
    end

    it "creates recipe with ingredients" do
      recipe = create(:recipe, :with_ingredients)
      expect(recipe.recipe_ingredients.count).to eq(3)
    end

    it "creates recipe with custom ingredients count" do
      recipe = create(:recipe, :with_ingredients, ingredients_count: 5)
      expect(recipe.recipe_ingredients.count).to eq(5)
    end

    it "creates recipe with ratings" do
      recipe = create(:recipe, :with_ratings)
      expect(recipe.ratings.count).to eq(3)
    end
  end
end
