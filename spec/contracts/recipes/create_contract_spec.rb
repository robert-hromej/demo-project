# frozen_string_literal: true

require "rails_helper"

RSpec.describe Recipes::CreateContract do
  subject(:contract) { described_class.new }

  let(:valid_params) do
    {
      title: "Omelette",
      instructions: "Mix eggs with milk and cook",
      prep_time_min: 5,
      cook_time_min: 10,
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
      let!(:category) { create(:category) }
      let!(:ingredient) { create(:ingredient) }

      it "passes validation" do
        result = contract.call(
          valid_params.merge(
            description: "Delicious breakfast",
            category_id: category.id,
            servings: 2,
            difficulty: "easy",
            ingredients: [
              { ingredient_id: ingredient.id, quantity: 3, unit: "pcs" },
            ],
          ),
        )
        expect(result).to be_success
      end
    end

    context "without title" do
      it "fails with missing title" do
        result = contract.call(valid_params.except(:title))
        expect(result).to be_failure
        expect(result.errors[:title]).to include("is missing")
      end
    end

    context "without instructions" do
      it "fails with missing instructions" do
        result = contract.call(valid_params.except(:instructions))
        expect(result).to be_failure
        expect(result.errors[:instructions]).to include("is missing")
      end
    end

    context "without prep_time_min" do
      it "fails with missing prep_time_min" do
        result = contract.call(valid_params.except(:prep_time_min))
        expect(result).to be_failure
        expect(result.errors[:prep_time_min]).to include("is missing")
      end
    end

    context "without cook_time_min" do
      it "fails with missing cook_time_min" do
        result = contract.call(valid_params.except(:cook_time_min))
        expect(result).to be_failure
        expect(result.errors[:cook_time_min]).to include("is missing")
      end
    end

    context "with title exceeding max length" do
      it "fails validation" do
        result = contract.call(valid_params.merge(title: "a" * 256))
        expect(result).to be_failure
        expect(result.errors[:title]).to be_present
      end
    end
  end

  describe "prep_time_min validation" do
    context "with zero value" do
      it "fails validation" do
        result = contract.call(valid_params.merge(prep_time_min: 0))
        expect(result).to be_failure
        expect(result.errors[:prep_time_min]).to be_present
      end
    end

    context "with negative value" do
      it "fails validation" do
        result = contract.call(valid_params.merge(prep_time_min: -5))
        expect(result).to be_failure
        expect(result.errors[:prep_time_min]).to be_present
      end
    end

    context "with positive value" do
      it "passes validation" do
        result = contract.call(valid_params.merge(prep_time_min: 15))
        expect(result).to be_success
      end
    end
  end

  describe "cook_time_min validation" do
    context "with zero value" do
      it "passes validation" do
        result = contract.call(valid_params.merge(cook_time_min: 0))
        expect(result).to be_success
      end
    end

    context "with negative value" do
      it "fails validation" do
        result = contract.call(valid_params.merge(cook_time_min: -5))
        expect(result).to be_failure
        expect(result.errors[:cook_time_min]).to be_present
      end
    end

    context "with positive value" do
      it "passes validation" do
        result = contract.call(valid_params.merge(cook_time_min: 30))
        expect(result).to be_success
      end
    end
  end

  describe "servings validation" do
    context "with zero value" do
      it "fails validation" do
        result = contract.call(valid_params.merge(servings: 0))
        expect(result).to be_failure
        expect(result.errors[:servings]).to be_present
      end
    end

    context "with positive value" do
      it "passes validation" do
        result = contract.call(valid_params.merge(servings: 4))
        expect(result).to be_success
      end
    end
  end

  describe "difficulty validation" do
    ["easy", "medium", "hard"].each do |difficulty|
      context "with valid difficulty '#{difficulty}'" do
        it "passes validation" do
          result = contract.call(valid_params.merge(difficulty: difficulty))
          expect(result).to be_success
        end
      end
    end

    context "with invalid difficulty" do
      it "fails validation" do
        result = contract.call(valid_params.merge(difficulty: "extreme"))
        expect(result).to be_failure
        expect(result.errors[:difficulty]).to be_present
      end
    end
  end

  describe "category_id validation" do
    context "with non-existent category_id" do
      it "fails validation" do
        result = contract.call(valid_params.merge(category_id: 99_999))
        expect(result).to be_failure
        expect(result.errors[:category_id]).to be_present
      end
    end

    context "with existing category_id" do
      let!(:category) { create(:category) }

      it "passes validation" do
        result = contract.call(valid_params.merge(category_id: category.id))
        expect(result).to be_success
      end
    end
  end

  describe "ingredients validation" do
    let!(:ingredient) { create(:ingredient) }

    context "with valid ingredients" do
      it "passes validation" do
        result = contract.call(
          valid_params.merge(
            ingredients: [
              { ingredient_id: ingredient.id, quantity: 2.5, unit: "pcs" },
            ],
          ),
        )
        expect(result).to be_success
      end
    end

    context "with non-existent ingredient_id" do
      it "fails validation" do
        result = contract.call(
          valid_params.merge(
            ingredients: [
              { ingredient_id: 99_999, quantity: 1, unit: "pcs" },
            ],
          ),
        )
        expect(result).to be_failure
        expect(result.errors[:ingredients]).to be_present
      end
    end

    context "with optional ingredient fields" do
      it "passes validation with notes" do
        result = contract.call(
          valid_params.merge(
            ingredients: [
              { ingredient_id: ingredient.id, quantity: 1, unit: "pcs", notes: "chopped" },
            ],
          ),
        )
        expect(result).to be_success
      end

      it "passes validation with optional flag" do
        result = contract.call(
          valid_params.merge(
            ingredients: [
              { ingredient_id: ingredient.id, quantity: 1, unit: "pcs", optional: true },
            ],
          ),
        )
        expect(result).to be_success
      end
    end

    context "with invalid ingredient structure" do
      it "fails when missing ingredient_id" do
        result = contract.call(
          valid_params.merge(
            ingredients: [
              { quantity: 1, unit: "pcs" },
            ],
          ),
        )
        expect(result).to be_failure
      end

      it "fails when missing quantity" do
        result = contract.call(
          valid_params.merge(
            ingredients: [
              { ingredient_id: ingredient.id, unit: "pcs" },
            ],
          ),
        )
        expect(result).to be_failure
      end

      it "fails when missing unit" do
        result = contract.call(
          valid_params.merge(
            ingredients: [
              { ingredient_id: ingredient.id, quantity: 1 },
            ],
          ),
        )
        expect(result).to be_failure
      end

      it "fails when quantity is zero" do
        result = contract.call(
          valid_params.merge(
            ingredients: [
              { ingredient_id: ingredient.id, quantity: 0, unit: "pcs" },
            ],
          ),
        )
        expect(result).to be_failure
      end
    end
  end
end
