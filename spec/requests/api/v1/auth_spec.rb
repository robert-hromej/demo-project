# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Auth", type: :request do
  describe "POST /api/v1/auth/register" do
    let(:valid_params) do
      {
        email: "newuser@example.com",
        password: "password123",
        password_confirmation: "password123",
        name: "New User",
      }
    end

    context "with valid params" do
      it "creates a new user and returns auth token" do
        expect do
          post "/api/v1/auth/register", params: valid_params.to_json, headers: json_headers
        end.to change(User, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(json_response[:user][:email]).to eq("newuser@example.com")
        expect(json_response[:user][:name]).to eq("New User")
        expect(json_response[:token]).to be_present
      end
    end

    context "with invalid email" do
      it "returns validation error" do
        post "/api/v1/auth/register", params: valid_params.merge(email: "invalid").to_json, headers: json_headers

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:error][:code]).to eq("validation_error")
      end
    end

    context "with mismatched passwords" do
      it "returns validation error" do
        post "/api/v1/auth/register",
             params: valid_params.merge(password_confirmation: "different").to_json,
             headers: json_headers

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:error][:code]).to eq("validation_error")
      end
    end

    context "with duplicate email" do
      before { create(:user, email: "newuser@example.com") }

      it "returns validation error" do
        post "/api/v1/auth/register", params: valid_params.to_json, headers: json_headers

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:error][:code]).to eq("validation_error")
      end
    end

    context "with missing required params" do
      it "returns validation error for missing email" do
        post "/api/v1/auth/register", params: valid_params.except(:email).to_json, headers: json_headers

        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "returns validation error for missing password" do
        post "/api/v1/auth/register", params: valid_params.except(:password).to_json, headers: json_headers

        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "returns validation error for missing name" do
        post "/api/v1/auth/register", params: valid_params.except(:name).to_json, headers: json_headers

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "POST /api/v1/auth/login" do
    let!(:user) { create(:user, email: "test@example.com", password: "password123") }
    let(:valid_params) do
      {
        email: "test@example.com",
        password: "password123",
      }
    end

    context "with valid credentials" do
      it "returns auth token" do
        post "/api/v1/auth/login", params: valid_params.to_json, headers: json_headers

        expect(response).to have_http_status(:created)
        expect(json_response[:user][:email]).to eq("test@example.com")
        expect(json_response[:token]).to be_present
      end
    end

    context "with invalid email" do
      it "returns unauthorized error" do
        post "/api/v1/auth/login",
             params: valid_params.merge(email: "wrong@example.com").to_json,
             headers: json_headers

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error][:code]).to eq("unauthorized")
      end
    end

    context "with invalid password" do
      it "returns unauthorized error" do
        post "/api/v1/auth/login",
             params: valid_params.merge(password: "wrongpassword").to_json,
             headers: json_headers

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error][:code]).to eq("unauthorized")
      end
    end

    context "with missing required params" do
      it "returns validation error for missing email" do
        post "/api/v1/auth/login", params: valid_params.except(:email).to_json, headers: json_headers

        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "returns validation error for missing password" do
        post "/api/v1/auth/login", params: valid_params.except(:password).to_json, headers: json_headers

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "GET /api/v1/auth/me" do
    context "with valid token" do
      let!(:user) { create(:user, email: "me@example.com", name: "Me User") }
      let(:token) { JwtService.encode(payload: { user_id: user.id, email: user.email }) }

      it "returns current user" do
        get "/api/v1/auth/me", headers: authenticated_headers(token: token)

        expect(response).to have_http_status(:ok)
        expect(json_response[:id]).to eq(user.id)
        expect(json_response[:email]).to eq("me@example.com")
        expect(json_response[:name]).to eq("Me User")
      end
    end

    context "without token" do
      it "returns unauthorized error" do
        get "/api/v1/auth/me"

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error][:code]).to eq("unauthorized")
      end
    end

    context "with invalid token" do
      it "returns unauthorized error" do
        get "/api/v1/auth/me", headers: authenticated_headers(token: "invalid.token.here")

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error][:code]).to eq("unauthorized")
      end
    end

    context "with expired token" do
      let!(:user) { create(:user) }
      let(:expired_token) { JwtService.encode(payload: { user_id: user.id, email: user.email }, exp: 1.hour.ago) }

      it "returns unauthorized error" do
        get "/api/v1/auth/me", headers: authenticated_headers(token: expired_token)

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error][:code]).to eq("unauthorized")
      end
    end

    context "with token for non-existent user" do
      let(:token) { JwtService.encode(payload: { user_id: 99_999, email: "deleted@example.com" }) }

      it "returns unauthorized error" do
        get "/api/v1/auth/me", headers: authenticated_headers(token: token)

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error][:code]).to eq("unauthorized")
      end
    end
  end
end
