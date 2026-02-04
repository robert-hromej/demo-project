# frozen_string_literal: true

require "rails_helper"

RSpec.describe Ratings::CreateContract do
  subject(:contract) { described_class.new }

  let(:valid_params) do
    {
      score: 4,
    }
  end

  describe "params validation" do
    context "with valid params" do
      it "passes validation with required params only" do
        result = contract.call(valid_params)
        expect(result).to be_success
      end

      it "passes validation with optional review" do
        result = contract.call(valid_params.merge(review: "Great recipe!"))
        expect(result).to be_success
      end
    end

    context "without score" do
      it "fails with missing score" do
        result = contract.call({})
        expect(result).to be_failure
        expect(result.errors[:score]).to include("is missing")
      end
    end
  end

  describe "score validation" do
    context "with valid scores" do
      (1..5).each do |score|
        it "passes validation with score #{score}" do
          result = contract.call(score: score)
          expect(result).to be_success
        end
      end
    end

    context "with invalid scores" do
      it "fails validation with zero" do
        result = contract.call(score: 0)
        expect(result).to be_failure
        expect(result.errors[:score]).to be_present
      end

      it "fails validation with negative value" do
        result = contract.call(score: -1)
        expect(result).to be_failure
        expect(result.errors[:score]).to be_present
      end

      it "fails validation with value greater than 5" do
        result = contract.call(score: 6)
        expect(result).to be_failure
        expect(result.errors[:score]).to be_present
      end
    end
  end

  describe "review validation" do
    context "with string value" do
      it "passes validation" do
        result = contract.call(valid_params.merge(review: "This is a great recipe!"))
        expect(result).to be_success
      end
    end

    context "with nil value" do
      it "passes validation" do
        result = contract.call(valid_params.merge(review: nil))
        expect(result).to be_success
      end
    end

    context "with empty string" do
      it "passes validation" do
        result = contract.call(valid_params.merge(review: ""))
        expect(result).to be_success
      end
    end

    context "with long review" do
      it "passes validation" do
        result = contract.call(valid_params.merge(review: "a" * 10_000))
        expect(result).to be_success
      end
    end
  end
end
