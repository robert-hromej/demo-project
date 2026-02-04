# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Ratings", type: :request do
  let!(:user) { create(:user) }
  let!(:recipe) { create(:recipe) }
  let(:token) { JwtService.encode(payload: { user_id: user.id, email: user.email }) }

  describe "GET /api/v1/recipes/:recipe_id/ratings" do
    context "when recipe has ratings" do
      let!(:ratings) do
        create_list(:rating, 3, :with_review, recipe: recipe, score: 4)
      end

      it "returns paginated ratings" do
        get "/api/v1/recipes/#{recipe.id}/ratings"

        expect(response).to have_http_status(:ok)
        expect(json_response[:data].size).to eq(3)
        expect(json_response[:meta][:total]).to eq(3)
        expect(json_response[:meta][:average_score]).to be_present
      end

      it "includes user information in response" do
        get "/api/v1/recipes/#{recipe.id}/ratings"

        expect(json_response[:data].first[:user]).to be_present
        expect(json_response[:data].first[:user][:email]).to be_present
      end

      it "supports pagination" do
        get "/api/v1/recipes/#{recipe.id}/ratings", params: { page: 1, per_page: 2 }

        expect(response).to have_http_status(:ok)
        expect(json_response[:data].size).to eq(2)
        expect(json_response[:meta][:total]).to eq(3)
        expect(json_response[:meta][:per_page]).to eq(2)
        expect(json_response[:meta][:total_pages]).to eq(2)
      end

      it "returns ratings in descending order by created_at" do
        get "/api/v1/recipes/#{recipe.id}/ratings"

        created_ats = json_response[:data].pluck(:created_at)
        expect(created_ats).to eq(created_ats.sort.reverse)
      end
    end

    context "when recipe has no ratings" do
      it "returns empty data array" do
        get "/api/v1/recipes/#{recipe.id}/ratings"

        expect(response).to have_http_status(:ok)
        expect(json_response[:data]).to eq([])
        expect(json_response[:meta][:total]).to eq(0)
      end
    end

    context "when recipe does not exist" do
      it "returns not found error" do
        get "/api/v1/recipes/99999/ratings"

        expect(response).to have_http_status(:not_found)
        expect(json_response[:error][:code]).to eq("not_found")
      end
    end
  end

  describe "POST /api/v1/recipes/:recipe_id/ratings" do
    let(:valid_params) do
      {
        score: 5,
        review: "Great recipe!",
      }
    end

    context "when authenticated" do
      context "with valid params" do
        it "creates a new rating" do
          expect do
            post "/api/v1/recipes/#{recipe.id}/ratings",
                 params: valid_params.to_json,
                 headers: authenticated_headers(token: token)
          end.to change(Rating, :count).by(1)

          expect(response).to have_http_status(:created)
          expect(json_response[:score]).to eq(5)
          expect(json_response[:review]).to eq("Great recipe!")
          expect(json_response[:user][:id]).to eq(user.id)
        end

        it "creates rating without review" do
          post "/api/v1/recipes/#{recipe.id}/ratings",
               params: { score: 4 }.to_json,
               headers: authenticated_headers(token: token)

          expect(response).to have_http_status(:created)
          expect(json_response[:score]).to eq(4)
          expect(json_response[:review]).to be_nil
        end
      end

      context "when user already rated the recipe" do
        let!(:existing_rating) { create(:rating, recipe: recipe, user: user, score: 3) }

        it "updates the existing rating" do
          expect do
            post "/api/v1/recipes/#{recipe.id}/ratings",
                 params: valid_params.to_json,
                 headers: authenticated_headers(token: token)
          end.not_to change(Rating, :count)

          expect(response).to have_http_status(:created)
          expect(json_response[:score]).to eq(5)
          expect(json_response[:review]).to eq("Great recipe!")

          existing_rating.reload
          expect(existing_rating.score).to eq(5)
          expect(existing_rating.review).to eq("Great recipe!")
        end
      end

      context "with invalid score" do
        it "returns validation error for score below 1" do
          post "/api/v1/recipes/#{recipe.id}/ratings",
               params: { score: 0 }.to_json,
               headers: authenticated_headers(token: token)

          expect(response).to have_http_status(:unprocessable_entity)
        end

        it "returns validation error for score above 5" do
          post "/api/v1/recipes/#{recipe.id}/ratings",
               params: { score: 6 }.to_json,
               headers: authenticated_headers(token: token)

          expect(response).to have_http_status(:unprocessable_entity)
        end
      end

      context "with missing score" do
        it "returns validation error" do
          post "/api/v1/recipes/#{recipe.id}/ratings",
               params: { review: "Nice!" }.to_json,
               headers: authenticated_headers(token: token)

          expect(response).to have_http_status(:unprocessable_entity)
        end
      end

      context "when recipe does not exist" do
        it "returns not found error" do
          post "/api/v1/recipes/99999/ratings",
               params: valid_params.to_json,
               headers: authenticated_headers(token: token)

          expect(response).to have_http_status(:not_found)
          expect(json_response[:error][:code]).to eq("not_found")
        end
      end
    end

    context "when not authenticated" do
      it "returns unauthorized error" do
        post "/api/v1/recipes/#{recipe.id}/ratings",
             params: valid_params.to_json,
             headers: json_headers

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error][:code]).to eq("unauthorized")
      end
    end
  end

  describe "DELETE /api/v1/recipes/:recipe_id/ratings" do
    context "when authenticated" do
      context "when user has a rating" do
        let!(:rating) { create(:rating, recipe: recipe, user: user) }

        it "deletes the rating" do
          expect do
            delete "/api/v1/recipes/#{recipe.id}/ratings",
                   headers: authenticated_headers(token: token)
          end.to change(Rating, :count).by(-1)

          expect(response).to have_http_status(:no_content)
        end
      end

      context "when user has no rating for the recipe" do
        it "returns not found error" do
          delete "/api/v1/recipes/#{recipe.id}/ratings",
                 headers: authenticated_headers(token: token)

          expect(response).to have_http_status(:not_found)
          expect(json_response[:error][:code]).to eq("not_found")
        end
      end

      context "when other user has a rating" do
        let!(:other_user) { create(:user) }
        let!(:other_rating) { create(:rating, recipe: recipe, user: other_user) }

        it "returns not found error and does not delete other user rating" do
          expect do
            delete "/api/v1/recipes/#{recipe.id}/ratings",
                   headers: authenticated_headers(token: token)
          end.not_to change(Rating, :count)

          expect(response).to have_http_status(:not_found)
        end
      end

      context "when recipe does not exist" do
        it "returns not found error" do
          delete "/api/v1/recipes/99999/ratings",
                 headers: authenticated_headers(token: token)

          expect(response).to have_http_status(:not_found)
          expect(json_response[:error][:code]).to eq("not_found")
        end
      end
    end

    context "when not authenticated" do
      let!(:rating) { create(:rating, recipe: recipe, user: user) }

      it "returns unauthorized error" do
        delete "/api/v1/recipes/#{recipe.id}/ratings",
               headers: json_headers

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error][:code]).to eq("unauthorized")
      end
    end
  end
end
