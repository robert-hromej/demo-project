# frozen_string_literal: true

require "rails_helper"

RSpec.describe Ratings::Create do
  describe ".call" do
    let!(:user) { create(:user) }
    let!(:recipe) { create(:recipe, avg_rating: 0, ratings_count: 0) }

    context "with valid params" do
      it "returns Success monad" do
        result = described_class.call(recipe_id: recipe.id, user: user, params: { score: 5 })

        expect(result).to be_success
      end

      it "creates a new rating" do
        expect {
          described_class.call(recipe_id: recipe.id, user: user, params: { score: 5 })
        }.to change(Rating, :count).by(1)
      end

      it "returns the created rating" do
        result = described_class.call(recipe_id: recipe.id, user: user, params: { score: 5 })
        rating = result.value!

        expect(rating).to be_a(Rating)
        expect(rating.score).to eq(5)
        expect(rating.user).to eq(user)
        expect(rating.recipe).to eq(recipe)
      end

      it "accepts review text" do
        result = described_class.call(
          recipe_id: recipe.id,
          user: user,
          params: { score: 4, review: "Great recipe!" },
        )

        expect(result.value!.review).to eq("Great recipe!")
      end

      it "updates recipe average rating" do
        described_class.call(recipe_id: recipe.id, user: user, params: { score: 5 })

        expect(recipe.reload.avg_rating).to eq(5.0)
        expect(recipe.ratings_count).to eq(1)
      end
    end

    context "when user already rated the recipe" do
      let!(:existing_rating) { create(:rating, recipe: recipe, user: user, score: 3) }

      it "updates existing rating instead of creating new one" do
        expect {
          described_class.call(recipe_id: recipe.id, user: user, params: { score: 5 })
        }.not_to change(Rating, :count)
      end

      it "updates the score" do
        described_class.call(recipe_id: recipe.id, user: user, params: { score: 5 })

        expect(existing_rating.reload.score).to eq(5)
      end

      it "updates the review" do
        described_class.call(
          recipe_id: recipe.id,
          user: user,
          params: { score: 5, review: "Updated review" },
        )

        expect(existing_rating.reload.review).to eq("Updated review")
      end

      it "returns the updated rating" do
        result = described_class.call(recipe_id: recipe.id, user: user, params: { score: 5 })

        expect(result.value!.id).to eq(existing_rating.id)
      end
    end

    context "with non-existent recipe" do
      it "returns Failure with not_found error" do
        result = described_class.call(recipe_id: 99_999, user: user, params: { score: 5 })

        expect(result).to be_failure
        expect(result.failure[:code]).to eq(:not_found)
        expect(result.failure[:message]).to eq("Recipe not found")
      end
    end

    context "with invalid params" do
      it "returns Failure for missing score" do
        result = described_class.call(recipe_id: recipe.id, user: user, params: {})

        expect(result).to be_failure
        expect(result.failure[:code]).to eq(:validation_error)
        expect(result.failure[:details][:score]).to be_present
      end

      it "returns Failure for score less than 1" do
        result = described_class.call(recipe_id: recipe.id, user: user, params: { score: 0 })

        expect(result).to be_failure
        expect(result.failure[:details][:score]).to be_present
      end

      it "returns Failure for score greater than 5" do
        result = described_class.call(recipe_id: recipe.id, user: user, params: { score: 6 })

        expect(result).to be_failure
        expect(result.failure[:details][:score]).to be_present
      end

      it "does not create rating on failure" do
        expect {
          described_class.call(recipe_id: recipe.id, user: user, params: { score: 0 })
        }.not_to change(Rating, :count)
      end
    end
  end
end
