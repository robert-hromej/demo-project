# frozen_string_literal: true

require "rails_helper"

RSpec.describe Recipes::UpdateContract do
  subject(:contract) { described_class.new }

  describe "params validation" do
    context "with empty params" do
      it "passes validation (all optional)" do
        result = contract.call({})
        expect(result).to be_success
      end
    end

    context "with only title" do
      it "passes validation" do
        result = contract.call(title: "Updated Recipe")
        expect(result).to be_success
      end
    end

    context "with title exceeding max length" do
      it "fails validation" do
        result = contract.call(title: "a" * 256)
        expect(result).to be_failure
        expect(result.errors[:title]).to be_present
      end
    end

    context "with empty title" do
      it "fails validation" do
        result = contract.call(title: "")
        expect(result).to be_failure
        expect(result.errors[:title]).to be_present
      end
    end
  end

  describe "prep_time_min validation" do
    context "with zero value" do
      it "fails validation" do
        result = contract.call(prep_time_min: 0)
        expect(result).to be_failure
        expect(result.errors[:prep_time_min]).to be_present
      end
    end

    context "with positive value" do
      it "passes validation" do
        result = contract.call(prep_time_min: 15)
        expect(result).to be_success
      end
    end
  end

  describe "cook_time_min validation" do
    context "with zero value" do
      it "passes validation" do
        result = contract.call(cook_time_min: 0)
        expect(result).to be_success
      end
    end

    context "with negative value" do
      it "fails validation" do
        result = contract.call(cook_time_min: -5)
        expect(result).to be_failure
        expect(result.errors[:cook_time_min]).to be_present
      end
    end
  end

  describe "servings validation" do
    context "with zero value" do
      it "fails validation" do
        result = contract.call(servings: 0)
        expect(result).to be_failure
        expect(result.errors[:servings]).to be_present
      end
    end

    context "with positive value" do
      it "passes validation" do
        result = contract.call(servings: 4)
        expect(result).to be_success
      end
    end
  end

  describe "difficulty validation" do
    ["easy", "medium", "hard"].each do |difficulty|
      context "with valid difficulty '#{difficulty}'" do
        it "passes validation" do
          result = contract.call(difficulty: difficulty)
          expect(result).to be_success
        end
      end
    end

    context "with invalid difficulty" do
      it "fails validation" do
        result = contract.call(difficulty: "extreme")
        expect(result).to be_failure
        expect(result.errors[:difficulty]).to be_present
      end
    end
  end

  describe "category_id validation" do
    context "with non-existent category_id" do
      it "fails validation" do
        result = contract.call(category_id: 99_999)
        expect(result).to be_failure
        expect(result.errors[:category_id]).to be_present
      end
    end

    context "with existing category_id" do
      let!(:category) { create(:category) }

      it "passes validation" do
        result = contract.call(category_id: category.id)
        expect(result).to be_success
      end
    end

    context "with nil category_id" do
      it "passes validation" do
        result = contract.call(category_id: nil)
        expect(result).to be_success
      end
    end
  end

  describe "ingredients validation" do
    let!(:ingredient) { create(:ingredient) }

    context "with valid ingredients" do
      it "passes validation" do
        result = contract.call(
          ingredients: [
            { ingredient_id: ingredient.id, quantity: 2.5, unit: "pcs" },
          ],
        )
        expect(result).to be_success
      end
    end

    context "with non-existent ingredient_id" do
      it "fails validation" do
        result = contract.call(
          ingredients: [
            { ingredient_id: 99_999, quantity: 1, unit: "pcs" },
          ],
        )
        expect(result).to be_failure
        expect(result.errors[:ingredients]).to be_present
      end
    end
  end
end
