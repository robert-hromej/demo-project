# frozen_string_literal: true

require "rails_helper"

RSpec.describe User do
  describe "validations" do
    subject { build(:user) }

    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
    it { is_expected.to allow_value("test@example.com").for(:email) }
    it { is_expected.not_to allow_value("invalid-email").for(:email) }
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_length_of(:name).is_at_most(100) }
    it { is_expected.to validate_length_of(:password).is_at_least(8) }

    context "when updating existing user without password" do
      let(:user) { create(:user) }

      it "allows update without password" do
        user.name = "New Name"
        expect(user).to be_valid
      end
    end
  end

  describe "associations" do
    it { is_expected.to have_many(:ratings).dependent(:destroy) }
    it { is_expected.to have_many(:rated_recipes).through(:ratings) }
  end

  describe "has_secure_password" do
    it { is_expected.to have_secure_password }
  end

  describe "normalizations" do
    it "normalizes email to lowercase and stripped" do
      user = build(:user, email: "  TEST@EXAMPLE.COM  ")
      user.validate
      expect(user.email).to eq("test@example.com")
    end
  end

  describe "factory" do
    it "creates a valid user" do
      expect(build(:user)).to be_valid
    end

    it "creates a valid user with avatar" do
      user = build(:user, :with_avatar)
      expect(user).to be_valid
      expect(user.avatar_url).to eq("https://example.com/avatar.jpg")
    end
  end
end
