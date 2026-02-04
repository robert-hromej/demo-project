# frozen_string_literal: true

require "rails_helper"

RSpec.describe Rating do
  describe "validations" do
    subject { build(:rating) }

    it { is_expected.to validate_presence_of(:score) }
    it { is_expected.to validate_inclusion_of(:score).in_range(1..5) }
    it { is_expected.to validate_uniqueness_of(:user_id).scoped_to(:recipe_id).with_message("has already rated this recipe") }
  end

  describe "associations" do
    it { is_expected.to belong_to(:recipe) }
    it { is_expected.to belong_to(:user) }
  end

  describe "counter_cache" do
    let(:recipe) { create(:recipe) }
    let(:user) { create(:user) }

    it "increments recipe ratings_count on create" do
      expect {
        create(:rating, recipe: recipe, user: user)
      }.to change { recipe.reload.ratings_count }.by(1)
    end

    it "decrements recipe ratings_count on destroy" do
      rating = create(:rating, recipe: recipe, user: user)
      expect {
        rating.destroy
      }.to change { recipe.reload.ratings_count }.by(-1)
    end
  end

  describe "callbacks" do
    describe "after_save" do
      let(:recipe) { create(:recipe) }
      let(:user) { create(:user) }

      it "updates recipe average rating on create" do
        create(:rating, recipe: recipe, user: user, score: 5)
        expect(recipe.reload.avg_rating).to eq(5.0)
      end

      it "updates recipe average rating on update" do
        rating = create(:rating, recipe: recipe, user: user, score: 3)
        rating.update!(score: 5)
        expect(recipe.reload.avg_rating).to eq(5.0)
      end
    end

    describe "after_destroy" do
      let(:recipe) { create(:recipe) }
      let(:first_user) { create(:user) }
      let(:second_user) { create(:user) }

      it "updates recipe average rating on destroy" do
        first_rating = create(:rating, recipe: recipe, user: first_user, score: 2)
        create(:rating, recipe: recipe, user: second_user, score: 4)

        first_rating.destroy
        expect(recipe.reload.avg_rating).to eq(4.0)
      end

      it "sets average rating to 0 when last rating is destroyed" do
        rating = create(:rating, recipe: recipe, user: first_user, score: 5)
        rating.destroy
        expect(recipe.reload.avg_rating).to eq(0.0)
      end
    end
  end

  describe "uniqueness constraint" do
    let(:recipe) { create(:recipe) }
    let(:user) { create(:user) }

    before do
      create(:rating, recipe: recipe, user: user)
    end

    it "prevents same user from rating same recipe twice" do
      duplicate = build(:rating, recipe: recipe, user: user)
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:user_id]).to include("has already rated this recipe")
    end

    it "allows same user to rate different recipes" do
      other_recipe = create(:recipe)
      new_rating = build(:rating, recipe: other_recipe, user: user)
      expect(new_rating).to be_valid
    end

    it "allows different users to rate same recipe" do
      other_user = create(:user)
      new_rating = build(:rating, recipe: recipe, user: other_user)
      expect(new_rating).to be_valid
    end
  end

  describe "factory" do
    it "creates a valid rating" do
      expect(build(:rating)).to be_valid
    end

    it "creates a rating with review" do
      rating = build(:rating, :with_review)
      expect(rating.review).to eq("Great recipe! Highly recommended.")
    end

    it "creates a low rating" do
      rating = build(:rating, :low)
      expect(rating.score).to eq(2)
    end

    it "creates a high rating" do
      rating = build(:rating, :high)
      expect(rating.score).to eq(5)
    end
  end
end
