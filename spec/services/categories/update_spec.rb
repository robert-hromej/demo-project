# frozen_string_literal: true

require "rails_helper"

RSpec.describe Categories::Update do
  describe ".call" do
    let!(:category) { create(:category, name: "Old Name", description: "Old description") }

    context "with valid params" do
      it "returns Success monad" do
        result = described_class.call(category: category, params: { name: "New Name" })

        expect(result).to be_success
      end

      it "updates the category name" do
        described_class.call(category: category, params: { name: "New Name" })

        expect(category.reload.name).to eq("New Name")
      end

      it "updates the category description" do
        described_class.call(category: category, params: { description: "New description" })

        expect(category.reload.description).to eq("New description")
      end

      it "updates multiple attributes" do
        result = described_class.call(
          category: category,
          params: { name: "Updated", description: "Updated desc", position: 10 },
        )

        updated = result.value!
        expect(updated.name).to eq("Updated")
        expect(updated.description).to eq("Updated desc")
        expect(updated.position).to eq(10)
      end

      it "returns the updated category" do
        result = described_class.call(category: category, params: { name: "New Name" })

        expect(result.value!).to eq(category.reload)
      end
    end

    context "with parent category" do
      let!(:parent) { create(:category, name: "Parent") }

      it "can set parent category" do
        result = described_class.call(category: category, params: { parent_id: parent.id })

        expect(result).to be_success
        expect(category.reload.parent).to eq(parent)
      end

      it "returns Failure for non-existent parent" do
        result = described_class.call(category: category, params: { parent_id: 99_999 })

        expect(result).to be_failure
        expect(result.failure[:details][:parent_id]).to be_present
      end
    end

    context "with invalid params" do
      it "returns Failure for empty name" do
        result = described_class.call(category: category, params: { name: "" })

        expect(result).to be_failure
        expect(result.failure[:details][:name]).to be_present
      end

      it "returns Failure for name exceeding max length" do
        result = described_class.call(category: category, params: { name: "a" * 101 })

        expect(result).to be_failure
        expect(result.failure[:details][:name]).to be_present
      end

      it "does not update category on failure" do
        described_class.call(category: category, params: { name: "" })

        expect(category.reload.name).to eq("Old Name")
      end
    end
  end
end
