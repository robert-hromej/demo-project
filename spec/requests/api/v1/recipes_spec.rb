# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Recipes", type: :request do
  let(:user) { create(:user) }
  let(:token) { JwtService.encode(payload: { user_id: user.id }) }
  let(:headers_with_auth) { { "Authorization" => "Bearer #{token}" } }
  let(:category) { create(:category) }

  describe "GET /api/v1/recipes" do
    context "without filters" do
      let!(:recipes) { create_list(:recipe, 5, :with_category) }

      it "returns all recipes with pagination meta" do
        get "/api/v1/recipes", headers: json_headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:data].size).to eq(5)
        expect(json_response[:meta]).to include(
          page: 1,
          per_page: 20,
          total: 5,
          total_pages: 1,
        )
      end
    end

    context "with query filter" do
      let!(:matching_recipe) { create(:recipe, title: "Delicious Pasta") }
      let!(:other_recipe) { create(:recipe, title: "Chicken Soup") }

      it "returns recipes matching the query" do
        get "/api/v1/recipes", params: { query: "pasta" }, headers: json_headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:data].size).to eq(1)
        expect(json_response[:data].first[:title]).to eq("Delicious Pasta")
      end
    end

    context "with category filter" do
      let!(:recipe_with_category) { create(:recipe, category: category) }
      let!(:recipe_without_category) { create(:recipe) }

      it "returns recipes in the specified category" do
        get "/api/v1/recipes", params: { category_id: category.id }, headers: json_headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:data].size).to eq(1)
        expect(json_response[:data].first[:id]).to eq(recipe_with_category.id)
      end
    end

    context "with difficulty filter" do
      let!(:easy_recipe) { create(:recipe, difficulty: :easy) }
      let!(:hard_recipe) { create(:recipe, difficulty: :hard) }

      it "returns recipes with the specified difficulty" do
        get "/api/v1/recipes", params: { difficulty: "hard" }, headers: json_headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:data].size).to eq(1)
        expect(json_response[:data].first[:difficulty]).to eq("hard")
      end
    end

    context "with max_cost filter" do
      let!(:cheap_recipe) { create(:recipe, :cheap) }
      let!(:expensive_recipe) { create(:recipe, :expensive) }

      it "returns recipes within budget" do
        get "/api/v1/recipes", params: { max_cost: 3000 }, headers: json_headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:data].size).to eq(1)
        expect(json_response[:data].first[:id]).to eq(cheap_recipe.id)
      end
    end

    context "with max_prep_time filter" do
      let!(:quick_recipe) { create(:recipe, prep_time_min: 10, cook_time_min: 5) }
      let!(:slow_recipe) { create(:recipe, prep_time_min: 60, cook_time_min: 120) }

      it "returns recipes within time limit" do
        get "/api/v1/recipes", params: { max_prep_time: 30 }, headers: json_headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:data].size).to eq(1)
        expect(json_response[:data].first[:id]).to eq(quick_recipe.id)
      end
    end

    context "with min_rating filter" do
      let!(:high_rated) { create(:recipe, :with_ratings, rating_score: 5) }
      let!(:low_rated) { create(:recipe, :with_ratings, rating_score: 2) }

      it "returns recipes with minimum rating" do
        get "/api/v1/recipes", params: { min_rating: 4 }, headers: json_headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:data].size).to eq(1)
        expect(json_response[:data].first[:id]).to eq(high_rated.id)
      end
    end

    context "with sorting" do
      let!(:cheap_recipe) { create(:recipe, est_cost_cents: 1000) }
      let!(:expensive_recipe) { create(:recipe, est_cost_cents: 5000) }
      let!(:medium_cost_recipe) { create(:recipe, est_cost_cents: 3000) }

      it "sorts by cost ascending" do
        get "/api/v1/recipes", params: { sort: "cost", order: "asc" }, headers: json_headers

        expect(response).to have_http_status(:ok)
        ids = json_response[:data].pluck(:id)
        expect(ids).to eq([cheap_recipe.id, medium_cost_recipe.id, expensive_recipe.id])
      end

      it "sorts by cost descending" do
        get "/api/v1/recipes", params: { sort: "cost", order: "desc" }, headers: json_headers

        expect(response).to have_http_status(:ok)
        ids = json_response[:data].pluck(:id)
        expect(ids).to eq([expensive_recipe.id, medium_cost_recipe.id, cheap_recipe.id])
      end
    end

    context "with pagination" do
      let!(:recipes) { create_list(:recipe, 25) }

      it "returns paginated results" do
        get "/api/v1/recipes", params: { page: 2, per_page: 10 }, headers: json_headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:data].size).to eq(10)
        expect(json_response[:meta]).to include(
          page: 2,
          per_page: 10,
          total: 25,
          total_pages: 3,
        )
      end
    end

    context "with invalid parameters" do
      it "rejects invalid difficulty" do
        get "/api/v1/recipes", params: { difficulty: "impossible" }, headers: json_headers

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response[:error][:code]).to eq("validation_error")
      end

      it "rejects invalid sort value" do
        get "/api/v1/recipes", params: { sort: "invalid" }, headers: json_headers

        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "rejects invalid order value" do
        get "/api/v1/recipes", params: { order: "invalid" }, headers: json_headers

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "GET /api/v1/recipes/:id" do
    let!(:recipe) { create(:recipe, :with_category, :with_ingredients) }

    context "when recipe exists" do
      it "returns the recipe with full details" do
        get "/api/v1/recipes/#{recipe.id}", headers: json_headers

        expect(response).to have_http_status(:ok)
        expect(json_response[:id]).to eq(recipe.id)
        expect(json_response[:title]).to eq(recipe.title)
        expect(json_response[:instructions]).to be_present
        expect(json_response[:category]).to be_present
        expect(json_response[:ingredients]).to be_an(Array)
        expect(json_response[:ingredients].size).to eq(recipe.recipe_ingredients.count)
      end

      it "includes computed fields" do
        get "/api/v1/recipes/#{recipe.id}", headers: json_headers

        expect(json_response).to include(
          :prep_time_min,
          :cook_time_min,
          :total_time_min,
          :est_cost_cents,
          :est_cost_formatted,
          :cost_per_serving_formatted,
          :avg_rating,
          :ratings_count,
        )
      end
    end

    context "when recipe does not exist" do
      it "returns 404" do
        get "/api/v1/recipes/999999", headers: json_headers

        expect(response).to have_http_status(:not_found)
        expect(json_response[:error][:code]).to eq("not_found")
      end
    end
  end

  describe "POST /api/v1/recipes" do
    let(:valid_params) do
      {
        title: "New Recipe",
        description: "A delicious new recipe",
        instructions: "Step 1: Prepare ingredients. Step 2: Cook. Step 3: Serve.",
        category_id: category.id,
        prep_time_min: 15,
        cook_time_min: 30,
        servings: 4,
        difficulty: "medium",
      }
    end

    context "when authenticated" do
      context "with valid parameters" do
        it "creates a new recipe" do
          expect {
            post "/api/v1/recipes", params: valid_params, headers: headers_with_auth
          }.to change(Recipe, :count).by(1)

          expect(response).to have_http_status(:created)
          expect(json_response[:title]).to eq("New Recipe")
          expect(json_response[:difficulty]).to eq("medium")
        end

        it "returns the created recipe with full details" do
          post "/api/v1/recipes", params: valid_params, headers: headers_with_auth

          expect(json_response).to include(
            :id,
            :title,
            :description,
            :instructions,
            :prep_time_min,
            :cook_time_min,
            :servings,
            :difficulty,
          )
        end
      end

      context "with ingredients" do
        let(:first_ingredient) { create(:ingredient) }
        let(:second_ingredient) { create(:ingredient) }
        let(:params_with_ingredients) do
          valid_params.merge(
            ingredients: [
              { ingredient_id: first_ingredient.id, quantity: "200", unit: "g", notes: "chopped" },
              { ingredient_id: second_ingredient.id, quantity: "100", unit: "ml", optional: true },
            ],
          )
        end

        it "creates recipe with ingredients" do
          expect {
            post "/api/v1/recipes", params: params_with_ingredients, headers: headers_with_auth
          }.to change(RecipeIngredient, :count).by(2)

          expect(response).to have_http_status(:created)
          expect(json_response[:ingredients].size).to eq(2)
        end
      end

      context "with invalid parameters" do
        it "returns error when title is missing" do
          invalid_params = valid_params.except(:title)

          post "/api/v1/recipes", params: invalid_params, headers: headers_with_auth

          expect(response).to have_http_status(:unprocessable_entity)
          expect(json_response[:error][:code]).to eq("validation_error")
        end

        it "returns error when instructions is missing" do
          invalid_params = valid_params.except(:instructions)

          post "/api/v1/recipes", params: invalid_params, headers: headers_with_auth

          expect(response).to have_http_status(:unprocessable_entity)
        end

        it "returns error when prep_time_min is missing" do
          invalid_params = valid_params.except(:prep_time_min)

          post "/api/v1/recipes", params: invalid_params, headers: headers_with_auth

          expect(response).to have_http_status(:unprocessable_entity)
        end

        it "returns error when cook_time_min is missing" do
          invalid_params = valid_params.except(:cook_time_min)

          post "/api/v1/recipes", params: invalid_params, headers: headers_with_auth

          expect(response).to have_http_status(:unprocessable_entity)
        end
      end
    end

    context "when not authenticated" do
      it "returns 401 unauthorized" do
        post "/api/v1/recipes", params: valid_params

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error][:code]).to eq("unauthorized")
      end
    end

    context "with invalid token" do
      it "returns 401 unauthorized" do
        invalid_headers = { "Authorization" => "Bearer invalid_token" }

        post "/api/v1/recipes", params: valid_params, headers: invalid_headers

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "PUT /api/v1/recipes/:id" do
    let!(:recipe) { create(:recipe, title: "Original Title", difficulty: :easy) }

    let(:update_params) do
      {
        title: "Updated Title",
        difficulty: "hard",
      }
    end

    context "when authenticated" do
      context "with valid parameters" do
        it "updates the recipe" do
          put "/api/v1/recipes/#{recipe.id}", params: update_params, headers: headers_with_auth

          expect(response).to have_http_status(:ok)
          expect(json_response[:title]).to eq("Updated Title")
          expect(json_response[:difficulty]).to eq("hard")
        end

        it "persists the changes" do
          put "/api/v1/recipes/#{recipe.id}", params: update_params, headers: headers_with_auth

          recipe.reload
          expect(recipe.title).to eq("Updated Title")
          expect(recipe.difficulty).to eq("hard")
        end
      end

      context "with partial update" do
        it "updates only specified fields" do
          put "/api/v1/recipes/#{recipe.id}", params: { title: "New Title" }, headers: headers_with_auth

          expect(response).to have_http_status(:ok)
          expect(json_response[:title]).to eq("New Title")
          expect(json_response[:difficulty]).to eq("easy")
        end
      end

      context "with ingredients update" do
        let!(:recipe) { create(:recipe, :with_ingredients, ingredients_count: 2) }
        let(:new_ingredient) { create(:ingredient) }
        let(:params_with_ingredients) do
          {
            ingredients: [
              { ingredient_id: new_ingredient.id, quantity: "500", unit: "g" },
            ],
          }
        end

        it "replaces existing ingredients" do
          expect(recipe.recipe_ingredients.count).to eq(2)

          put "/api/v1/recipes/#{recipe.id}", params: params_with_ingredients, headers: headers_with_auth

          expect(response).to have_http_status(:ok)
          recipe.reload
          expect(recipe.recipe_ingredients.count).to eq(1)
          expect(recipe.ingredients.first.id).to eq(new_ingredient.id)
        end
      end

      context "when recipe does not exist" do
        it "returns 404" do
          put "/api/v1/recipes/999999", params: update_params, headers: headers_with_auth

          expect(response).to have_http_status(:not_found)
          expect(json_response[:error][:code]).to eq("not_found")
        end
      end
    end

    context "when not authenticated" do
      it "returns 401 unauthorized" do
        put "/api/v1/recipes/#{recipe.id}", params: update_params

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /api/v1/recipes/:id" do
    let!(:recipe) { create(:recipe) }

    context "when authenticated" do
      it "deletes the recipe" do
        expect {
          delete "/api/v1/recipes/#{recipe.id}", headers: headers_with_auth
        }.to change(Recipe, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end

      it "returns empty body" do
        delete "/api/v1/recipes/#{recipe.id}", headers: headers_with_auth

        expect(response.body).to be_empty
      end

      context "with associated ingredients" do
        let!(:recipe) { create(:recipe, :with_ingredients, ingredients_count: 3) }

        it "deletes recipe and its ingredients" do
          expect {
            delete "/api/v1/recipes/#{recipe.id}", headers: headers_with_auth
          }.to change(RecipeIngredient, :count).by(-3)
        end
      end

      context "with associated ratings" do
        let!(:recipe) { create(:recipe, :with_ratings, ratings_count: 2) }

        it "deletes recipe and its ratings" do
          expect {
            delete "/api/v1/recipes/#{recipe.id}", headers: headers_with_auth
          }.to change(Rating, :count).by(-2)
        end
      end

      context "when recipe does not exist" do
        it "returns 404" do
          delete "/api/v1/recipes/999999", headers: headers_with_auth

          expect(response).to have_http_status(:not_found)
          expect(json_response[:error][:code]).to eq("not_found")
        end
      end
    end

    context "when not authenticated" do
      it "returns 401 unauthorized" do
        delete "/api/v1/recipes/#{recipe.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "response format" do
    let!(:recipe) { create(:recipe, :with_category) }

    it "returns JSON content type" do
      get "/api/v1/recipes/#{recipe.id}", headers: json_headers

      expect(response.content_type).to include("application/json")
    end

    it "includes correct entity fields" do
      get "/api/v1/recipes/#{recipe.id}", headers: json_headers

      expect(json_response.keys).to include(
        :id,
        :title,
        :description,
        :prep_time_min,
        :cook_time_min,
        :total_time_min,
        :servings,
        :difficulty,
        :est_cost_cents,
        :est_cost_formatted,
        :cost_per_serving_formatted,
        :avg_rating,
        :ratings_count,
        :created_at,
        :updated_at,
      )
    end
  end

  describe "combined filters" do
    let(:target_category) { create(:category, name: "Desserts") }
    let!(:matching_recipe) do
      create(
        :recipe,
        title: "Chocolate Cake",
        category: target_category,
        difficulty: :medium,
        est_cost_cents: 5000,
        prep_time_min: 20,
        cook_time_min: 40,
        avg_rating: 4.5,
      )
    end
    let!(:wrong_category) do
      create(
        :recipe,
        title: "Chocolate Cookie",
        difficulty: :medium,
        est_cost_cents: 5000,
        avg_rating: 4.5,
      )
    end
    let!(:wrong_difficulty) do
      create(
        :recipe,
        category: target_category,
        difficulty: :hard,
        est_cost_cents: 5000,
        avg_rating: 4.5,
      )
    end
    let!(:too_expensive) do
      create(
        :recipe,
        category: target_category,
        difficulty: :medium,
        est_cost_cents: 20_000,
        avg_rating: 4.5,
      )
    end
    let!(:low_rated) do
      create(
        :recipe,
        category: target_category,
        difficulty: :medium,
        est_cost_cents: 5000,
        avg_rating: 2.0,
      )
    end

    it "applies multiple filters simultaneously" do
      get "/api/v1/recipes", params: {
        query: "Chocolate",
        category_id: target_category.id,
        difficulty: "medium",
        max_cost: 10_000,
        min_rating: 4,
      }, headers: json_headers

      expect(response).to have_http_status(:ok)
      expect(json_response[:data].size).to eq(1)
      expect(json_response[:data].first[:id]).to eq(matching_recipe.id)
    end
  end
end
