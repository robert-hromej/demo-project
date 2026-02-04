# frozen_string_literal: true

require "rails_helper"

RSpec.describe Recipes::SearchByBudgetContract do
  subject(:contract) { described_class.new }

  let(:valid_params) do
    {
      budget_cents: 10_000,
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
            servings: 4,
            category_id: 1,
          ),
        )
        expect(result).to be_success
      end
    end

    context "without budget_cents" do
      it "fails with missing budget_cents" do
        result = contract.call({})
        expect(result).to be_failure
        expect(result.errors[:budget_cents]).to include("is missing")
      end
    end
  end

  describe "budget_cents validation" do
    context "with positive value" do
      it "passes validation" do
        result = contract.call(budget_cents: 5000)
        expect(result).to be_success
      end
    end

    context "with zero value" do
      it "fails validation" do
        result = contract.call(budget_cents: 0)
        expect(result).to be_failure
        expect(result.errors[:budget_cents]).to be_present
      end
    end

    context "with negative value" do
      it "fails validation" do
        result = contract.call(budget_cents: -1000)
        expect(result).to be_failure
        expect(result.errors[:budget_cents]).to be_present
      end
    end
  end

  describe "servings validation" do
    context "with positive value" do
      it "passes validation" do
        result = contract.call(valid_params.merge(servings: 4))
        expect(result).to be_success
      end
    end

    context "with zero value" do
      it "fails validation" do
        result = contract.call(valid_params.merge(servings: 0))
        expect(result).to be_failure
        expect(result.errors[:servings]).to be_present
      end
    end

    context "with negative value" do
      it "fails validation" do
        result = contract.call(valid_params.merge(servings: -2))
        expect(result).to be_failure
        expect(result.errors[:servings]).to be_present
      end
    end
  end

  describe "category_id validation" do
    context "with any integer value" do
      it "passes validation" do
        result = contract.call(valid_params.merge(category_id: 123))
        expect(result).to be_success
      end
    end

    context "with nil value" do
      it "passes validation" do
        result = contract.call(valid_params.merge(category_id: nil))
        expect(result).to be_success
      end
    end
  end
end
