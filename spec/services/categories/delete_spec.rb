# frozen_string_literal: true

require "rails_helper"

RSpec.describe Categories::Delete do
  describe ".call" do
    let!(:category) { create(:category) }

    context "with no dependent recipes" do
      it "returns Success monad" do
        result = described_class.call(category: category)

        expect(result).to be_success
      end

      it "deletes the category" do
        expect {
          described_class.call(category: category)
        }.to change(Category, :count).by(-1)
      end

      it "returns true on success" do
        result = described_class.call(category: category)

        expect(result.value!).to be(true)
      end
    end

    context "with dependent recipes" do
      before do
        create(:recipe, category: category)
      end

      it "returns Failure monad" do
        result = described_class.call(category: category)

        expect(result).to be_failure
      end

      it "returns has_dependent_records error" do
        result = described_class.call(category: category)

        expect(result.failure[:code]).to eq(:has_dependent_records)
        expect(result.failure[:message]).to eq("Cannot delete category with recipes")
      end

      it "does not delete the category" do
        expect {
          described_class.call(category: category)
        }.not_to change(Category, :count)
      end
    end
  end
end
