# frozen_string_literal: true

require "rails_helper"

RSpec.describe Ratings::Delete do
  describe ".call" do
    let!(:user) { create(:user) }
    let!(:other_user) { create(:user) }
    let!(:recipe) { create(:recipe) }
    let!(:rating) do
      r = create(:rating, recipe: recipe, user: user, score: 4)
      recipe.recalculate_rating!
      r
    end

    context "with existing rating" do
      it "returns Success monad" do
        result = described_class.call(recipe_id: recipe.id, user: user)

        expect(result).to be_success
      end

      it "deletes the rating" do
        expect {
          described_class.call(recipe_id: recipe.id, user: user)
        }.to change(Rating, :count).by(-1)
      end

      it "returns true on success" do
        result = described_class.call(recipe_id: recipe.id, user: user)

        expect(result.value!).to be(true)
      end

      it "updates recipe average rating" do
        described_class.call(recipe_id: recipe.id, user: user)

        expect(recipe.reload.avg_rating).to eq(0)
        expect(recipe.ratings_count).to eq(0)
      end
    end

    context "with non-existent recipe" do
      it "returns Failure with not_found error" do
        result = described_class.call(recipe_id: 99_999, user: user)

        expect(result).to be_failure
        expect(result.failure[:code]).to eq(:not_found)
        expect(result.failure[:message]).to eq("Recipe not found")
      end
    end

    context "when user has not rated the recipe" do
      it "returns Failure with not_found error" do
        result = described_class.call(recipe_id: recipe.id, user: other_user)

        expect(result).to be_failure
        expect(result.failure[:code]).to eq(:not_found)
        expect(result.failure[:message]).to eq("Rating not found")
      end

      it "does not delete any rating" do
        expect {
          described_class.call(recipe_id: recipe.id, user: other_user)
        }.not_to change(Rating, :count)
      end
    end

    context "with multiple ratings" do
      let!(:other_rating) { create(:rating, recipe: recipe, user: other_user, score: 5) }

      before do
        recipe.recalculate_rating!
      end

      it "only deletes the user rating" do
        expect {
          described_class.call(recipe_id: recipe.id, user: user)
        }.to change(Rating, :count).by(-1)

        expect(Rating.find_by(id: rating.id)).to be_nil
        expect(Rating.find_by(id: other_rating.id)).to eq(other_rating)
      end

      it "recalculates average with remaining ratings" do
        described_class.call(recipe_id: recipe.id, user: user)

        expect(recipe.reload.avg_rating).to eq(5.0)
        expect(recipe.ratings_count).to eq(1)
      end
    end
  end
end
