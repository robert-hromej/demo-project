# frozen_string_literal: true

require "rails_helper"

RSpec.describe "API V1 Categories", type: :request do
  let(:user) { create(:user) }
  let(:auth_token) { JwtService.encode(payload: { user_id: user.id }) }
  let(:auth_headers) { { "Authorization" => "Bearer #{auth_token}" } }

  describe "GET /api/v1/categories" do
    let!(:category1) { create(:category, name: "Appetizers", position: 1) }
    let!(:category2) { create(:category, name: "Main Dishes", position: 2) }
    let!(:child_category) { create(:category, name: "Soups", parent: category1, position: 0) }

    it "returns a list of root categories" do
      get "/api/v1/categories"

      expect(response).to have_http_status(:ok)
      expect(json_body.size).to eq(2)
      expect(json_body.pluck(:name)).to contain_exactly("Appetizers", "Main Dishes")
    end

    it "does not include children by default" do
      get "/api/v1/categories"

      expect(response).to have_http_status(:ok)
      appetizers = json_body.find { |c| c[:name] == "Appetizers" }
      expect(appetizers).not_to have_key(:children)
    end

    context "with include_children=true" do
      it "includes children categories" do
        get "/api/v1/categories", params: { include_children: true }

        expect(response).to have_http_status(:ok)
        appetizers = json_body.find { |c| c[:name] == "Appetizers" }
        expect(appetizers[:children]).to be_an(Array)
        expect(appetizers[:children].first[:name]).to eq("Soups")
      end
    end
  end

  describe "GET /api/v1/categories/:id" do
    let!(:parent) { create(:category, name: "Parent Category") }
    let!(:category) { create(:category, name: "Test Category", parent: parent) }
    let!(:child) { create(:category, name: "Child Category", parent: category) }

    it "returns the category with children and parent" do
      get "/api/v1/categories/#{category.id}"

      expect(response).to have_http_status(:ok)
      expect(json_body[:id]).to eq(category.id)
      expect(json_body[:name]).to eq("Test Category")
      expect(json_body[:children]).to be_an(Array)
      expect(json_body[:children].first[:name]).to eq("Child Category")
      expect(json_body[:parent][:name]).to eq("Parent Category")
    end

    it "returns 404 for non-existent category" do
      get "/api/v1/categories/99999"

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/categories" do
    let(:valid_params) { { name: "New Category", description: "A new category" } }

    context "when authenticated" do
      it "creates a new category" do
        expect {
          post "/api/v1/categories", params: valid_params, headers: auth_headers
        }.to change(Category, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(json_body[:name]).to eq("New Category")
        expect(json_body[:description]).to eq("A new category")
      end

      it "creates a subcategory" do
        parent = create(:category, name: "Parent")

        post "/api/v1/categories", params: valid_params.merge(parent_id: parent.id), headers: auth_headers

        expect(response).to have_http_status(:created)
        expect(Category.last.parent).to eq(parent)
      end

      it "returns validation error for missing name" do
        post "/api/v1/categories", params: { description: "No name" }, headers: auth_headers

        expect(response).to have_http_status(:unprocessable_content)
        # Grape returns validation error in array format for missing required params
        expect(json_body[:error]).to be_present
      end

      it "returns validation error for invalid params" do
        post "/api/v1/categories", params: { name: "" }, headers: auth_headers

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_body[:error][:code]).to eq("validation_error")
      end
    end

    context "when not authenticated" do
      it "returns 401 unauthorized" do
        post "/api/v1/categories", params: valid_params

        expect(response).to have_http_status(:unauthorized)
        expect(json_body[:error][:code]).to eq("unauthorized")
      end
    end
  end

  describe "PUT /api/v1/categories/:id" do
    let!(:category) { create(:category, name: "Old Name", description: "Old description") }
    let(:update_params) { { name: "Updated Name", description: "Updated description" } }

    context "when authenticated" do
      it "updates the category" do
        put "/api/v1/categories/#{category.id}", params: update_params, headers: auth_headers

        expect(response).to have_http_status(:ok)
        expect(json_body[:name]).to eq("Updated Name")
        expect(json_body[:description]).to eq("Updated description")
        expect(category.reload.name).to eq("Updated Name")
      end

      it "updates only specified fields" do
        put "/api/v1/categories/#{category.id}", params: { name: "New Name Only" }, headers: auth_headers

        expect(response).to have_http_status(:ok)
        expect(category.reload.name).to eq("New Name Only")
        expect(category.description).to eq("Old description")
      end

      it "returns 404 for non-existent category" do
        put "/api/v1/categories/99999", params: update_params, headers: auth_headers

        expect(response).to have_http_status(:not_found)
      end

      it "returns validation error for invalid params" do
        put "/api/v1/categories/#{category.id}", params: { name: "" }, headers: auth_headers

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_body[:error][:code]).to eq("validation_error")
      end
    end

    context "when not authenticated" do
      it "returns 401 unauthorized" do
        put "/api/v1/categories/#{category.id}", params: update_params

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /api/v1/categories/:id" do
    let!(:category) { create(:category) }

    context "when authenticated" do
      it "deletes the category" do
        expect {
          delete "/api/v1/categories/#{category.id}", headers: auth_headers
        }.to change(Category, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end

      it "returns 404 for non-existent category" do
        delete "/api/v1/categories/99999", headers: auth_headers

        expect(response).to have_http_status(:not_found)
      end

      context "with dependent recipes" do
        before do
          create(:recipe, category: category)
        end

        it "returns error and does not delete" do
          expect {
            delete "/api/v1/categories/#{category.id}", headers: auth_headers
          }.not_to change(Category, :count)

          expect(response).to have_http_status(:bad_request)
          expect(json_body[:error][:code]).to eq("has_dependent_records")
        end
      end
    end

    context "when not authenticated" do
      it "returns 401 unauthorized" do
        delete "/api/v1/categories/#{category.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  private

  def json_body
    JSON.parse(response.body, symbolize_names: true)
  end
end
