# frozen_string_literal: true

require "rails_helper"

RSpec.describe Users::Authenticate do
  describe ".call" do
    let!(:user) { create(:user, email: "test@example.com", password: "password123") }

    let(:valid_params) do
      {
        email: "test@example.com",
        password: "password123",
      }
    end

    context "with valid credentials" do
      it "returns Success monad" do
        result = described_class.call(params: valid_params)

        expect(result).to be_success
      end

      it "returns user and token in result" do
        result = described_class.call(params: valid_params)
        value = result.value!

        expect(value[:user]).to eq(user)
        expect(value[:token]).to be_a(String)
      end

      it "generates valid JWT token" do
        result = described_class.call(params: valid_params)
        token = result.value![:token]
        decoded = JwtService.decode(token: token)

        expect(decoded[:user_id]).to eq(user.id)
        expect(decoded[:email]).to eq(user.email)
      end

      it "handles case-insensitive email" do
        result = described_class.call(params: valid_params.merge(email: "TEST@EXAMPLE.COM"))

        expect(result).to be_success
        expect(result.value![:user]).to eq(user)
      end
    end

    context "with invalid credentials" do
      it "returns Failure for non-existent email" do
        result = described_class.call(params: valid_params.merge(email: "unknown@example.com"))

        expect(result).to be_failure
        expect(result.failure[:code]).to eq(:unauthorized)
        expect(result.failure[:message]).to eq("Invalid email or password")
      end

      it "returns Failure for wrong password" do
        result = described_class.call(params: valid_params.merge(password: "wrongpassword"))

        expect(result).to be_failure
        expect(result.failure[:code]).to eq(:unauthorized)
        expect(result.failure[:message]).to eq("Invalid email or password")
      end

      it "returns Failure for missing email" do
        result = described_class.call(params: valid_params.except(:email))

        expect(result).to be_failure
        expect(result.failure[:code]).to eq(:validation_error)
      end

      it "returns Failure for missing password" do
        result = described_class.call(params: valid_params.except(:password))

        expect(result).to be_failure
        expect(result.failure[:code]).to eq(:validation_error)
      end
    end
  end
end
