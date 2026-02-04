# frozen_string_literal: true

require "rails_helper"

RSpec.describe Categories::UpdateContract do
  subject(:contract) { described_class.new }

  describe "params validation" do
    context "with empty params" do
      it "passes validation (all optional)" do
        result = contract.call({})
        expect(result).to be_success
      end
    end

    context "with only name" do
      it "passes validation" do
        result = contract.call(name: "Updated Name")
        expect(result).to be_success
      end
    end

    context "with only description" do
      it "passes validation" do
        result = contract.call(description: "Updated description")
        expect(result).to be_success
      end
    end

    context "with only position" do
      it "passes validation" do
        result = contract.call(position: 5)
        expect(result).to be_success
      end
    end

    context "with name exceeding max length" do
      it "fails validation" do
        result = contract.call(name: "a" * 101)
        expect(result).to be_failure
        expect(result.errors[:name]).to be_present
      end
    end

    context "with empty name string" do
      it "fails validation" do
        result = contract.call(name: "")
        expect(result).to be_failure
        expect(result.errors[:name]).to be_present
      end
    end
  end

  describe "parent_id validation" do
    context "with non-existent parent_id" do
      it "fails validation" do
        result = contract.call(parent_id: 99_999)
        expect(result).to be_failure
        expect(result.errors[:parent_id]).to be_present
      end
    end

    context "with existing parent_id" do
      let!(:parent_category) { create(:category) }

      it "passes validation" do
        result = contract.call(parent_id: parent_category.id)
        expect(result).to be_success
      end
    end

    context "with nil parent_id" do
      it "passes validation" do
        result = contract.call(parent_id: nil)
        expect(result).to be_success
      end
    end
  end
end
