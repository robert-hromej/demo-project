# frozen_string_literal: true

require "rails_helper"

RSpec.describe Category do
  describe "validations" do
    subject { build(:category) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_length_of(:name).is_at_most(100) }
  end

  describe "associations" do
    it { is_expected.to have_many(:recipes).dependent(:nullify) }
  end

  describe "ancestry" do
    let(:parent_category) { create(:category, name: "Parent") }
    let(:child_category) { create(:category, name: "Child", parent: parent_category) }

    it "supports parent-child relationships" do
      expect(child_category.parent).to eq(parent_category)
      expect(parent_category.children).to include(child_category)
    end

    it "supports ancestry queries" do
      expect(child_category.ancestors).to include(parent_category)
      expect(parent_category.descendants).to include(child_category)
    end
  end

  describe "scopes" do
    describe ".roots" do
      let!(:root_category) { create(:category, name: "Root") }
      let!(:child_category) { create(:category, name: "Child", parent: root_category) }

      it "returns only root categories" do
        expect(described_class.roots).to include(root_category)
        expect(described_class.roots).not_to include(child_category)
      end
    end

    describe "default_scope" do
      let!(:category_b) { create(:category, name: "B", position: 2) }
      let!(:category_a) { create(:category, name: "A", position: 1) }
      let!(:category_c) { create(:category, name: "C", position: 3) }

      it "orders by position" do
        expect(described_class.all.to_a).to eq([category_a, category_b, category_c])
      end
    end
  end

  describe "factory" do
    it "creates a valid category" do
      expect(build(:category)).to be_valid
    end

    it "creates a valid category with parent" do
      category = create(:category, :with_parent)
      expect(category).to be_valid
      expect(category.parent).to be_present
    end

    it "creates a valid category with children" do
      category = create(:category, :with_children)
      expect(category).to be_valid
      expect(category.children.count).to eq(2)
    end
  end
end
