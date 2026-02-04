# frozen_string_literal: true

require "rails_helper"

RSpec.describe Categories::Create do
  describe ".call" do
    let(:valid_params) do
      {
        name: "Main Dishes",
        description: "Delicious main courses",
      }
    end

    context "with valid params" do
      it "returns Success monad" do
        result = described_class.call(params: valid_params)

        expect(result).to be_success
      end

      it "creates a new category" do
        expect {
          described_class.call(params: valid_params)
        }.to change(Category, :count).by(1)
      end

      it "returns the created category" do
        result = described_class.call(params: valid_params)
        category = result.value!

        expect(category).to be_a(Category)
        expect(category.name).to eq("Main Dishes")
        expect(category.description).to eq("Delicious main courses")
      end

      it "sets default position" do
        result = described_class.call(params: valid_params)

        expect(result.value!.position).to eq(0)
      end

      it "accepts custom position" do
        result = described_class.call(params: valid_params.merge(position: 5))

        expect(result.value!.position).to eq(5)
      end
    end

    context "with parent category" do
      let!(:parent) { create(:category, name: "Food") }

      it "creates subcategory successfully" do
        result = described_class.call(params: valid_params.merge(parent_id: parent.id))

        expect(result).to be_success
        expect(result.value!.parent).to eq(parent)
      end

      it "returns Failure for non-existent parent" do
        result = described_class.call(params: valid_params.merge(parent_id: 99_999))

        expect(result).to be_failure
        expect(result.failure[:code]).to eq(:validation_error)
        expect(result.failure[:details][:parent_id]).to be_present
      end
    end

    context "with invalid params" do
      it "returns Failure for missing name" do
        result = described_class.call(params: valid_params.except(:name))

        expect(result).to be_failure
        expect(result.failure[:code]).to eq(:validation_error)
        expect(result.failure[:details][:name]).to be_present
      end

      it "returns Failure for empty name" do
        result = described_class.call(params: valid_params.merge(name: ""))

        expect(result).to be_failure
        expect(result.failure[:details][:name]).to be_present
      end

      it "returns Failure for name exceeding max length" do
        result = described_class.call(params: valid_params.merge(name: "a" * 101))

        expect(result).to be_failure
        expect(result.failure[:details][:name]).to be_present
      end

      it "does not create category on failure" do
        expect {
          described_class.call(params: valid_params.except(:name))
        }.not_to change(Category, :count)
      end
    end
  end
end
