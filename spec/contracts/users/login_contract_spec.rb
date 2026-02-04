# frozen_string_literal: true

require "rails_helper"

RSpec.describe Users::LoginContract do
  subject(:contract) { described_class.new }

  let(:valid_params) do
    {
      email: "test@example.com",
      password: "password123",
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

    context "with empty email" do
      it "fails validation" do
        result = contract.call(valid_params.merge(email: ""))
        expect(result).to be_failure
        expect(result.errors[:email]).to be_present
      end
    end

    context "with empty password" do
      it "fails validation" do
        result = contract.call(valid_params.merge(password: ""))
        expect(result).to be_failure
        expect(result.errors[:password]).to be_present
      end
    end
  end
end
