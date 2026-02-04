# frozen_string_literal: true

require "rails_helper"

RSpec.describe Recipes::SearchContract do
  subject(:contract) { described_class.new }

  describe "params validation" do
    context "with empty params" do
      it "passes validation (all optional)" do
        result = contract.call({})
        expect(result).to be_success
      end
    end

    context "with all valid params" do
      it "passes validation" do
        result = contract.call(
          query: "omelette",
          category_id: 1,
          difficulty: "easy",
          max_cost: 5000,
          max_prep_time: 30,
          min_rating: 3.5,
          sort: "rating",
          order: "desc",
          page: 1,
          per_page: 20,
        )
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

  describe "max_cost validation" do
    context "with positive value" do
      it "passes validation" do
        result = contract.call(max_cost: 10_000)
        expect(result).to be_success
      end
    end

    context "with zero value" do
      it "fails validation" do
        result = contract.call(max_cost: 0)
        expect(result).to be_failure
        expect(result.errors[:max_cost]).to be_present
      end
    end
  end

  describe "max_prep_time validation" do
    context "with positive value" do
      it "passes validation" do
        result = contract.call(max_prep_time: 60)
        expect(result).to be_success
      end
    end

    context "with zero value" do
      it "fails validation" do
        result = contract.call(max_prep_time: 0)
        expect(result).to be_failure
        expect(result.errors[:max_prep_time]).to be_present
      end
    end
  end

  describe "min_rating validation" do
    context "with valid range" do
      it "passes validation with zero" do
        result = contract.call(min_rating: 0)
        expect(result).to be_success
      end

      it "passes validation with five" do
        result = contract.call(min_rating: 5)
        expect(result).to be_success
      end

      it "passes validation with decimal" do
        result = contract.call(min_rating: 3.5)
        expect(result).to be_success
      end
    end

    context "with value exceeding 5" do
      it "fails validation" do
        result = contract.call(min_rating: 6)
        expect(result).to be_failure
        expect(result.errors[:min_rating]).to be_present
      end
    end

    context "with negative value" do
      it "fails validation" do
        result = contract.call(min_rating: -1)
        expect(result).to be_failure
        expect(result.errors[:min_rating]).to be_present
      end
    end
  end

  describe "sort validation" do
    ["rating", "cost", "time"].each do |sort|
      context "with valid sort '#{sort}'" do
        it "passes validation" do
          result = contract.call(sort: sort)
          expect(result).to be_success
        end
      end
    end

    context "with invalid sort" do
      it "fails validation" do
        result = contract.call(sort: "invalid")
        expect(result).to be_failure
        expect(result.errors[:sort]).to be_present
      end
    end
  end

  describe "order validation" do
    ["asc", "desc"].each do |order|
      context "with valid order '#{order}'" do
        it "passes validation" do
          result = contract.call(order: order)
          expect(result).to be_success
        end
      end
    end

    context "with invalid order" do
      it "fails validation" do
        result = contract.call(order: "invalid")
        expect(result).to be_failure
        expect(result.errors[:order]).to be_present
      end
    end
  end

  describe "page validation" do
    context "with positive page" do
      it "passes validation" do
        result = contract.call(page: 1)
        expect(result).to be_success
      end
    end

    context "with zero page" do
      it "fails validation" do
        result = contract.call(page: 0)
        expect(result).to be_failure
        expect(result.errors[:page]).to be_present
      end
    end
  end

  describe "per_page validation" do
    context "with valid per_page" do
      it "passes validation with minimum value" do
        result = contract.call(per_page: 1)
        expect(result).to be_success
      end

      it "passes validation with maximum value" do
        result = contract.call(per_page: 100)
        expect(result).to be_success
      end
    end

    context "with per_page exceeding maximum" do
      it "fails validation" do
        result = contract.call(per_page: 101)
        expect(result).to be_failure
        expect(result.errors[:per_page]).to be_present
      end
    end
  end
end
