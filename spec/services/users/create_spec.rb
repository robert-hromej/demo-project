# frozen_string_literal: true

require "rails_helper"

RSpec.describe Users::Create do
  describe ".call" do
    let(:valid_params) do
      {
        email: "newuser@example.com",
        password: "password123",
        password_confirmation: "password123",
        name: "New User",
      }
    end

    context "with valid params" do
      it "returns Success monad" do
        result = described_class.call(params: valid_params)

        expect(result).to be_success
      end

      it "creates a new user" do
        expect {
          described_class.call(params: valid_params)
        }.to change(User, :count).by(1)
      end

      it "returns user and token in result" do
        result = described_class.call(params: valid_params)
        value = result.value!

        expect(value[:user]).to be_a(User)
        expect(value[:user].email).to eq("newuser@example.com")
        expect(value[:token]).to be_a(String)
      end

      it "generates valid JWT token" do
        result = described_class.call(params: valid_params)
        token = result.value![:token]
        decoded = JwtService.decode(token: token)

        expect(decoded[:user_id]).to eq(result.value![:user].id)
        expect(decoded[:email]).to eq("newuser@example.com")
      end
    end

    context "with invalid params" do
      it "returns Failure for missing email" do
        result = described_class.call(params: valid_params.except(:email))

        expect(result).to be_failure
        expect(result.failure[:code]).to eq(:validation_error)
        expect(result.failure[:details][:email]).to be_present
      end

      it "returns Failure for invalid email format" do
        result = described_class.call(params: valid_params.merge(email: "invalid-email"))

        expect(result).to be_failure
        expect(result.failure[:details][:email]).to be_present
      end

      it "returns Failure for weak password" do
        result = described_class.call(params: valid_params.merge(password: "short", password_confirmation: "short"))

        expect(result).to be_failure
        expect(result.failure[:details][:password]).to be_present
      end

      it "returns Failure when passwords dont match" do
        result = described_class.call(params: valid_params.merge(password_confirmation: "different"))

        expect(result).to be_failure
        expect(result.failure[:details][:password_confirmation]).to be_present
      end

      it "returns Failure for duplicate email" do
        create(:user, email: "newuser@example.com")
        result = described_class.call(params: valid_params)

        expect(result).to be_failure
        expect(result.failure[:details][:email]).to be_present
      end

      it "does not create user on failure" do
        expect {
          described_class.call(params: valid_params.except(:email))
        }.not_to change(User, :count)
      end
    end
  end
end
