# frozen_string_literal: true

require "rails_helper"

RSpec.describe Categories::CreateContract do
  subject(:contract) { described_class.new }

  let(:valid_params) do
    {
      name: "Main Dishes",
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
      let!(:parent_category) { create(:category) }

      it "passes validation" do
        result = contract.call(
          valid_params.merge(
            description: "Delicious main dishes",
            parent_id: parent_category.id,
            position: 1,
          ),
        )
        expect(result).to be_success
      end
    end

    context "without name" do
      it "fails with missing name" do
        result = contract.call(valid_params.except(:name))
        expect(result).to be_failure
        expect(result.errors[:name]).to include("is missing")
      end
    end

    context "with empty name" do
      it "fails validation" do
        result = contract.call(valid_params.merge(name: ""))
        expect(result).to be_failure
        expect(result.errors[:name]).to be_present
      end
    end

    context "with name exceeding max length" do
      it "fails validation" do
        result = contract.call(valid_params.merge(name: "a" * 101))
        expect(result).to be_failure
        expect(result.errors[:name]).to be_present
      end
    end

    context "with name at max length" do
      it "passes validation" do
        result = contract.call(valid_params.merge(name: "a" * 100))
        expect(result).to be_success
      end
    end
  end

  describe "parent_id validation" do
    context "with non-existent parent_id" do
      it "fails validation" do
        result = contract.call(valid_params.merge(parent_id: 99_999))
        expect(result).to be_failure
        expect(result.errors[:parent_id]).to be_present
      end
    end

    context "with existing parent_id" do
      let!(:parent_category) { create(:category) }

      it "passes validation" do
        result = contract.call(valid_params.merge(parent_id: parent_category.id))
        expect(result).to be_success
      end
    end

    context "with nil parent_id" do
      it "passes validation" do
        result = contract.call(valid_params.merge(parent_id: nil))
        expect(result).to be_success
      end
    end
  end
end
