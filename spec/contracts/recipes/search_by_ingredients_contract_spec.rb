# frozen_string_literal: true

require "rails_helper"

RSpec.describe Recipes::SearchByIngredientsContract do
  subject(:contract) { described_class.new }

  let(:valid_params) do
    {
      ingredient_ids: [1, 2, 3],
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
            match_percentage: 80,
            include_optional: true,
            category_id: 1,
            max_cost: 10_000,
          ),
        )
        expect(result).to be_success
      end
    end

    context "without ingredient_ids" do
      it "fails with missing ingredient_ids" do
        result = contract.call({})
        expect(result).to be_failure
        expect(result.errors[:ingredient_ids]).to include("is missing")
      end
    end
  end

  describe "ingredient_ids validation" do
    context "with empty array" do
      it "fails validation" do
        result = contract.call(ingredient_ids: [])
        expect(result).to be_failure
        expect(result.errors[:ingredient_ids]).to be_present
      end
    end

    context "with single ingredient" do
      it "passes validation" do
        result = contract.call(ingredient_ids: [1])
        expect(result).to be_success
      end
    end

    context "with multiple ingredients" do
      it "passes validation" do
        result = contract.call(ingredient_ids: [1, 2, 3, 4, 5])
        expect(result).to be_success
      end
    end
  end

  describe "match_percentage validation" do
    context "with valid range" do
      it "passes validation with minimum value (1)" do
        result = contract.call(valid_params.merge(match_percentage: 1))
        expect(result).to be_success
      end

      it "passes validation with maximum value (100)" do
        result = contract.call(valid_params.merge(match_percentage: 100))
        expect(result).to be_success
      end

      it "passes validation with middle value" do
        result = contract.call(valid_params.merge(match_percentage: 50))
        expect(result).to be_success
      end
    end

    context "with invalid values" do
      it "fails validation with zero" do
        result = contract.call(valid_params.merge(match_percentage: 0))
        expect(result).to be_failure
        expect(result.errors[:match_percentage]).to be_present
      end

      it "fails validation exceeding 100" do
        result = contract.call(valid_params.merge(match_percentage: 101))
        expect(result).to be_failure
        expect(result.errors[:match_percentage]).to be_present
      end

      it "fails validation with negative value" do
        result = contract.call(valid_params.merge(match_percentage: -10))
        expect(result).to be_failure
        expect(result.errors[:match_percentage]).to be_present
      end
    end
  end

  describe "include_optional validation" do
    context "with true value" do
      it "passes validation" do
        result = contract.call(valid_params.merge(include_optional: true))
        expect(result).to be_success
      end
    end

    context "with false value" do
      it "passes validation" do
        result = contract.call(valid_params.merge(include_optional: false))
        expect(result).to be_success
      end
    end
  end

  describe "max_cost validation" do
    context "with positive value" do
      it "passes validation" do
        result = contract.call(valid_params.merge(max_cost: 10_000))
        expect(result).to be_success
      end
    end

    context "with zero value" do
      it "fails validation" do
        result = contract.call(valid_params.merge(max_cost: 0))
        expect(result).to be_failure
        expect(result.errors[:max_cost]).to be_present
      end
    end
  end
end
