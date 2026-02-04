# frozen_string_literal: true

require "rails_helper"

RSpec.describe Users::CreateContract do
  subject(:contract) { described_class.new }

  let(:valid_params) do
    {
      email: "test@example.com",
      password: "password123",
      password_confirmation: "password123",
      name: "Test User",
    }
  end

  describe "params validation" do
    context "with valid params" do
      it "passes validation" do
        result = contract.call(valid_params)
        expect(result).to be_success
      end
    end

    context "without email" do
      it "fails with missing email" do
        result = contract.call(valid_params.except(:email))
        expect(result).to be_failure
        expect(result.errors[:email]).to include("is missing")
      end
    end

    context "without password" do
      it "fails with missing password" do
        result = contract.call(valid_params.except(:password))
        expect(result).to be_failure
        expect(result.errors[:password]).to include("is missing")
      end
    end

    context "without password_confirmation" do
      it "fails with missing password_confirmation" do
        result = contract.call(valid_params.except(:password_confirmation))
        expect(result).to be_failure
        expect(result.errors[:password_confirmation]).to include("is missing")
      end
    end

    context "without name" do
      it "fails with missing name" do
        result = contract.call(valid_params.except(:name))
        expect(result).to be_failure
        expect(result.errors[:name]).to include("is missing")
      end
    end

    context "with name exceeding max length" do
      it "fails validation" do
        result = contract.call(valid_params.merge(name: "a" * 101))
        expect(result).to be_failure
        expect(result.errors[:name]).to be_present
      end
    end
  end

  describe "email format validation" do
    context "with invalid email format" do
      it "fails with invalid-email" do
        result = contract.call(valid_params.merge(email: "invalid-email"))
        expect(result).to be_failure
        expect(result.errors[:email]).to be_present
      end
    end

    context "with valid email format" do
      it "passes validation" do
        result = contract.call(valid_params.merge(email: "valid@example.com"))
        expect(result).to be_success
      end
    end
  end

  describe "password strength validation" do
    context "with short password" do
      it "fails when password is less than 8 characters" do
        result = contract.call(valid_params.merge(password: "short", password_confirmation: "short"))
        expect(result).to be_failure
        expect(result.errors[:password]).to be_present
      end
    end

    context "with strong password" do
      it "passes validation" do
        result = contract.call(valid_params.merge(password: "strongpassword", password_confirmation: "strongpassword"))
        expect(result).to be_success
      end
    end
  end

  describe "password confirmation validation" do
    context "when passwords do not match" do
      it "fails validation" do
        result = contract.call(valid_params.merge(password_confirmation: "different"))
        expect(result).to be_failure
        expect(result.errors[:password_confirmation]).to be_present
      end
    end

    context "when passwords match" do
      it "passes validation" do
        result = contract.call(valid_params)
        expect(result).to be_success
      end
    end
  end

  describe "email uniqueness validation" do
    context "when email already exists" do
      before { create(:user, email: "test@example.com") }

      it "fails validation" do
        result = contract.call(valid_params)
        expect(result).to be_failure
        expect(result.errors[:email]).to be_present
      end
    end

    context "when email is unique" do
      it "passes validation" do
        result = contract.call(valid_params.merge(email: "unique@example.com"))
        expect(result).to be_success
      end
    end

    context "when email exists with different case" do
      before { create(:user, email: "TEST@EXAMPLE.COM") }

      it "fails validation (case insensitive)" do
        result = contract.call(valid_params)
        expect(result).to be_failure
        expect(result.errors[:email]).to be_present
      end
    end
  end
end
