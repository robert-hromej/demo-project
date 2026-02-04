# frozen_string_literal: true

require "rails_helper"

RSpec.describe Ingredients::SearchContract do
  subject(:contract) { described_class.new }

  describe "params validation" do
    context "with empty params" do
      it "passes validation (all optional)" do
        result = contract.call({})
        expect(result).to be_success
      end
    end

    context "with query" do
      it "passes validation" do
        result = contract.call(query: "tomato")
        expect(result).to be_success
      end
    end

    context "with category" do
      it "passes validation" do
        result = contract.call(category: "vegetables")
        expect(result).to be_success
      end
    end

    context "with all params" do
      it "passes validation" do
        result = contract.call(
          query: "tomato",
          category: "vegetables",
          page: 1,
          per_page: 20,
        )
        expect(result).to be_success
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

    context "with negative page" do
      it "fails validation" do
        result = contract.call(page: -1)
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

    context "with zero per_page" do
      it "fails validation" do
        result = contract.call(per_page: 0)
        expect(result).to be_failure
        expect(result.errors[:per_page]).to be_present
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
