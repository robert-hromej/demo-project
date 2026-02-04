# frozen_string_literal: true

require "rails_helper"

RSpec.describe "API V1 Ingredients", type: :request do
  let(:user) { create(:user) }
  let(:auth_token) { JwtService.encode(payload: { user_id: user.id }) }
  let(:auth_headers) { { "Authorization" => "Bearer #{auth_token}" } }

  describe "GET /api/v1/ingredients" do
    let!(:tomato) { create(:ingredient, name: "Tomato", name_uk: "Pomidor", category: "vegetables") }
    let!(:milk) { create(:ingredient, name: "Milk", name_uk: "Moloko", category: "dairy") }
    let!(:cheese) { create(:ingredient, name: "Cheese", name_uk: "Syr", category: "dairy") }

    it "returns a list of ingredients with pagination meta" do
      get "/api/v1/ingredients"

      expect(response).to have_http_status(:ok)
      expect(json_body[:data].size).to eq(3)
      expect(json_body[:meta][:page]).to eq(1)
      expect(json_body[:meta][:total]).to eq(3)
    end

    it "filters by query" do
      get "/api/v1/ingredients", params: { query: "Tom" }

      expect(response).to have_http_status(:ok)
      expect(json_body[:data].size).to eq(1)
      expect(json_body[:data].first[:name]).to eq("Tomato")
    end

    it "filters by category" do
      get "/api/v1/ingredients", params: { category: "dairy" }

      expect(response).to have_http_status(:ok)
      expect(json_body[:data].size).to eq(2)
      names = json_body[:data].pluck(:name)
      expect(names).to contain_exactly("Cheese", "Milk")
    end

    it "supports pagination" do
      create_list(:ingredient, 25)

      get "/api/v1/ingredients", params: { page: 2, per_page: 10 }

      expect(response).to have_http_status(:ok)
      expect(json_body[:data].size).to eq(10)
      expect(json_body[:meta][:page]).to eq(2)
      expect(json_body[:meta][:per_page]).to eq(10)
      expect(json_body[:meta][:total]).to eq(28)
    end
  end

  describe "GET /api/v1/ingredients/:id" do
    let!(:ingredient) { create(:ingredient, name: "Tomato", name_uk: "Pomidor", unit_price_cents: 1500) }

    it "returns the ingredient" do
      get "/api/v1/ingredients/#{ingredient.id}"

      expect(response).to have_http_status(:ok)
      expect(json_body[:id]).to eq(ingredient.id)
      expect(json_body[:name]).to eq("Tomato")
      expect(json_body[:name_uk]).to eq("Pomidor")
      expect(json_body[:unit_price_cents]).to eq(1500)
      expect(json_body[:unit_price_formatted]).to eq("15.00 UAH")
    end

    it "returns 404 for non-existent ingredient" do
      get "/api/v1/ingredients/99999"

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/ingredients" do
    let(:valid_params) do
      {
        name: "New Ingredient",
        name_uk: "Novyi Ingridiient",
        default_unit: "g",
        category: "vegetables",
        unit_price_cents: 500,
      }
    end

    context "when authenticated" do
      it "creates a new ingredient" do
        expect {
          post "/api/v1/ingredients", params: valid_params, headers: auth_headers
        }.to change(Ingredient, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(json_body[:name]).to eq("New Ingredient")
        expect(json_body[:name_uk]).to eq("Novyi Ingridiient")
        expect(json_body[:default_unit]).to eq("g")
        expect(json_body[:category]).to eq("vegetables")
        expect(json_body[:unit_price_cents]).to eq(500)
      end

      it "creates ingredient with default unit" do
        params = { name: "Simple", name_uk: "Prostyi" }

        post "/api/v1/ingredients", params: params, headers: auth_headers

        expect(response).to have_http_status(:created)
        expect(json_body[:default_unit]).to eq("pcs")
      end

      it "returns validation error for missing name" do
        post "/api/v1/ingredients", params: { name_uk: "Only Ukrainian" }, headers: auth_headers

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_body[:error]).to be_present
      end

      it "returns validation error for missing name_uk" do
        post "/api/v1/ingredients", params: { name: "Only English" }, headers: auth_headers

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_body[:error]).to be_present
      end

      it "returns validation error for invalid unit" do
        params = valid_params.merge(default_unit: "invalid_unit")

        post "/api/v1/ingredients", params: params, headers: auth_headers

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_body[:error][:code]).to eq("validation_error")
      end

      it "returns validation error for duplicate name" do
        create(:ingredient, name: "Existing")

        post "/api/v1/ingredients", params: valid_params.merge(name: "Existing"), headers: auth_headers

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_body[:error][:details][:name]).to be_present
      end
    end

    context "when not authenticated" do
      it "returns 401 unauthorized" do
        post "/api/v1/ingredients", params: valid_params

        expect(response).to have_http_status(:unauthorized)
        expect(json_body[:error][:code]).to eq("unauthorized")
      end
    end
  end

  describe "PUT /api/v1/ingredients/:id" do
    let!(:ingredient) { create(:ingredient, name: "Old Name", name_uk: "Stara Nazva") }
    let(:update_params) { { name: "Updated Name", unit_price_cents: 2000 } }

    context "when authenticated" do
      it "updates the ingredient" do
        put "/api/v1/ingredients/#{ingredient.id}", params: update_params, headers: auth_headers

        expect(response).to have_http_status(:ok)
        expect(json_body[:name]).to eq("Updated Name")
        expect(json_body[:unit_price_cents]).to eq(2000)
        expect(ingredient.reload.name).to eq("Updated Name")
      end

      it "updates only specified fields" do
        put "/api/v1/ingredients/#{ingredient.id}", params: { name: "New Name Only" }, headers: auth_headers

        expect(response).to have_http_status(:ok)
        expect(ingredient.reload.name).to eq("New Name Only")
        expect(ingredient.name_uk).to eq("Stara Nazva")
      end

      it "returns 404 for non-existent ingredient" do
        put "/api/v1/ingredients/99999", params: update_params, headers: auth_headers

        expect(response).to have_http_status(:not_found)
      end

      it "returns validation error for empty name" do
        put "/api/v1/ingredients/#{ingredient.id}", params: { name: "" }, headers: auth_headers

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_body[:error][:code]).to eq("validation_error")
      end

      it "returns validation error for invalid unit" do
        put "/api/v1/ingredients/#{ingredient.id}", params: { default_unit: "invalid" }, headers: auth_headers

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_body[:error][:code]).to eq("validation_error")
      end

      it "returns validation error for duplicate name" do
        create(:ingredient, name: "Existing")

        put "/api/v1/ingredients/#{ingredient.id}", params: { name: "Existing" }, headers: auth_headers

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_body[:error][:details][:name]).to be_present
      end

      it "allows keeping the same name" do
        put "/api/v1/ingredients/#{ingredient.id}", params: { name: ingredient.name }, headers: auth_headers

        expect(response).to have_http_status(:ok)
      end
    end

    context "when not authenticated" do
      it "returns 401 unauthorized" do
        put "/api/v1/ingredients/#{ingredient.id}", params: update_params

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /api/v1/ingredients/:id" do
    let!(:ingredient) { create(:ingredient) }

    context "when authenticated" do
      it "deletes the ingredient" do
        expect {
          delete "/api/v1/ingredients/#{ingredient.id}", headers: auth_headers
        }.to change(Ingredient, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end

      it "returns 404 for non-existent ingredient" do
        delete "/api/v1/ingredients/99999", headers: auth_headers

        expect(response).to have_http_status(:not_found)
      end

      context "with dependent recipe_ingredients" do
        before do
          recipe = create(:recipe)
          create(:recipe_ingredient, recipe: recipe, ingredient: ingredient)
        end

        it "returns error and does not delete" do
          expect {
            delete "/api/v1/ingredients/#{ingredient.id}", headers: auth_headers
          }.not_to change(Ingredient, :count)

          expect(response).to have_http_status(:bad_request)
          expect(json_body[:error][:code]).to eq("has_dependent_records")
        end
      end
    end

    context "when not authenticated" do
      it "returns 401 unauthorized" do
        delete "/api/v1/ingredients/#{ingredient.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  private

  def json_body
    JSON.parse(response.body, symbolize_names: true)
  end
end
