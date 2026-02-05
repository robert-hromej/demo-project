# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Search API", type: :request do
  let(:json_headers) { { "Content-Type" => "application/json", "Accept" => "application/json" } }

  describe "POST /api/v1/search/by-ingredients" do
    let(:category) { create(:category) }
    let(:other_category) { create(:category) }

    let(:tomato) { create(:ingredient, name: "tomato") }
    let(:onion) { create(:ingredient, name: "onion") }
    let(:garlic) { create(:ingredient, name: "garlic") }
    let(:basil) { create(:ingredient, name: "basil") }
    let(:cheese) { create(:ingredient, name: "cheese") }
    let(:olive_oil) { create(:ingredient, name: "olive_oil") }

    let!(:recipe_full_match) do
      recipe = create(:recipe, title: "Tomato Soup", category: category, est_cost_cents: 3000)
      create(:recipe_ingredient, recipe: recipe, ingredient: tomato, optional: false)
      create(:recipe_ingredient, recipe: recipe, ingredient: onion, optional: false)
      recipe
    end

    let!(:recipe_partial_match) do
      recipe = create(:recipe, title: "Pasta Sauce", category: category, est_cost_cents: 5000)
      create(:recipe_ingredient, recipe: recipe, ingredient: tomato, optional: false)
      create(:recipe_ingredient, recipe: recipe, ingredient: onion, optional: false)
      create(:recipe_ingredient, recipe: recipe, ingredient: garlic, optional: false)
      create(:recipe_ingredient, recipe: recipe, ingredient: basil, optional: false)
      recipe
    end

    let!(:recipe_with_optional) do
      recipe = create(:recipe, title: "Salad", category: other_category, est_cost_cents: 2500)
      create(:recipe_ingredient, recipe: recipe, ingredient: tomato, optional: false)
      create(:recipe_ingredient, recipe: recipe, ingredient: onion, optional: false)
      create(:recipe_ingredient, recipe: recipe, ingredient: cheese, optional: true)
      recipe
    end

    let!(:recipe_no_match) do
      recipe = create(:recipe, title: "Pizza", category: other_category, est_cost_cents: 8000)
      create(:recipe_ingredient, recipe: recipe, ingredient: cheese, optional: false)
      create(:recipe_ingredient, recipe: recipe, ingredient: olive_oil, optional: false)
      recipe
    end

    context "when searching with 100% match" do
      it "returns only recipes where all required ingredients match" do
        post "/api/v1/search/by-ingredients",
             params: { ingredient_ids: [tomato.id, onion.id], match_percentage: 100 }.to_json,
             headers: json_headers

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)

        expect(json[:data].length).to eq(2)
        titles = json[:data].pluck(:title)
        expect(titles).to include("Tomato Soup", "Salad")
        expect(titles).not_to include("Pasta Sauce", "Pizza")
      end

      it "returns match_percentage of 100 for full matches" do
        post "/api/v1/search/by-ingredients",
             params: { ingredient_ids: [tomato.id, onion.id], match_percentage: 100 }.to_json,
             headers: json_headers

        json = JSON.parse(response.body, symbolize_names: true)
        recipe_data = json[:data].find { |r| r[:title] == "Tomato Soup" }

        expect(recipe_data[:match_percentage]).to eq(100.0)
        expect(recipe_data[:matched_ingredients]).to eq(2)
        expect(recipe_data[:total_ingredients]).to eq(2)
      end
    end

    context "when searching with partial match (80%)" do
      it "returns recipes with at least 80% ingredient match" do
        post "/api/v1/search/by-ingredients",
             params: { ingredient_ids: [tomato.id, onion.id, garlic.id], match_percentage: 80 }.to_json,
             headers: json_headers

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)

        # Full match: Tomato Soup (2/2 = 100%), Salad (2/2 = 100%)
        # Pasta Sauce: 3/4 = 75% < 80%
        expect(json[:data].length).to eq(2)
      end

      it "includes recipes when match percentage exceeds threshold" do
        post "/api/v1/search/by-ingredients",
             params: { ingredient_ids: [tomato.id, onion.id, garlic.id, basil.id], match_percentage: 50 }.to_json,
             headers: json_headers

        json = JSON.parse(response.body, symbolize_names: true)

        # Pasta Sauce: 4/4 = 100%
        # Tomato Soup: 2/2 = 100%
        # Salad: 2/2 = 100%
        expect(json[:data].length).to eq(3)
      end
    end

    context "when returning missing ingredients" do
      it "includes list of missing ingredients for partial matches" do
        post "/api/v1/search/by-ingredients",
             params: { ingredient_ids: [tomato.id, onion.id, garlic.id, basil.id], match_percentage: 50 }.to_json,
             headers: json_headers

        json = JSON.parse(response.body, symbolize_names: true)

        tomato_soup = json[:data].find { |r| r[:title] == "Tomato Soup" }
        expect(tomato_soup[:missing_ingredients]).to be_an(Array)
        expect(tomato_soup[:missing_ingredients]).to be_empty # Full match

        # Pasta Sauce has all 4 ingredients matched
        pasta_sauce = json[:data].find { |r| r[:title] == "Pasta Sauce" }
        expect(pasta_sauce[:missing_ingredients]).to be_empty
      end

      it "lists ingredients not provided by user" do
        post "/api/v1/search/by-ingredients",
             params: { ingredient_ids: [tomato.id, onion.id], match_percentage: 50 }.to_json,
             headers: json_headers

        json = JSON.parse(response.body, symbolize_names: true)

        # For Pasta Sauce (4 ingredients: tomato, onion, garlic, basil)
        # User provided: tomato, onion
        # Missing: garlic, basil
        pasta_sauce = json[:data].find { |r| r[:title] == "Pasta Sauce" }
        missing_names = pasta_sauce[:missing_ingredients].pluck(:name)
        expect(missing_names).to contain_exactly("garlic", "basil")
      end
    end

    context "when filtering by category" do
      it "returns only recipes from specified category" do
        post "/api/v1/search/by-ingredients",
             params: { ingredient_ids: [tomato.id, onion.id], category_id: category.id, match_percentage: 50 }.to_json,
             headers: json_headers

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)

        titles = json[:data].pluck(:title)
        expect(titles).to include("Tomato Soup", "Pasta Sauce")
        expect(titles).not_to include("Salad")
      end
    end

    context "when filtering by max cost" do
      it "returns only recipes within cost limit" do
        post "/api/v1/search/by-ingredients",
             params: { ingredient_ids: [tomato.id, onion.id], max_cost: 3000, match_percentage: 50 }.to_json,
             headers: json_headers

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)

        titles = json[:data].pluck(:title)
        expect(titles).to include("Tomato Soup", "Salad")
        expect(titles).not_to include("Pasta Sauce") # costs 5000
      end
    end

    context "when using pagination" do
      before do
        # Create additional recipes to test pagination
        10.times do |i|
          recipe = create(:recipe, title: "Extra Recipe #{i}")
          create(:recipe_ingredient, recipe: recipe, ingredient: tomato, optional: false)
        end
      end

      it "returns paginated results" do
        post "/api/v1/search/by-ingredients",
             params: { ingredient_ids: [tomato.id], match_percentage: 100, page: 1, per_page: 5 }.to_json,
             headers: json_headers

        json = JSON.parse(response.body, symbolize_names: true)

        expect(json[:data].length).to eq(5)
        expect(json[:meta][:page]).to eq(1)
        expect(json[:meta][:per_page]).to eq(5)
        expect(json[:meta][:total_pages]).to be >= 2
      end

      it "returns correct page of results" do
        post "/api/v1/search/by-ingredients",
             params: { ingredient_ids: [tomato.id], match_percentage: 100, page: 2, per_page: 5 }.to_json,
             headers: json_headers

        json = JSON.parse(response.body, symbolize_names: true)

        expect(json[:data].length).to be >= 1
        expect(json[:meta][:page]).to eq(2)
      end
    end

    context "when include_optional is true" do
      it "considers optional ingredients in matching" do
        post "/api/v1/search/by-ingredients",
             params: {
               ingredient_ids: [tomato.id, onion.id, cheese.id],
               match_percentage: 100,
               include_optional: true,
             }.to_json,
             headers: json_headers

        json = JSON.parse(response.body, symbolize_names: true)

        # Salad has 3 ingredients (2 required + 1 optional)
        # With include_optional, user needs all 3 to match 100%
        salad = json[:data].find { |r| r[:title] == "Salad" }
        expect(salad).to be_present
        expect(salad[:match_percentage]).to eq(100.0)
      end
    end

    context "with validation errors" do
      it "returns error when ingredient_ids is empty" do
        post "/api/v1/search/by-ingredients",
             params: { ingredient_ids: [] }.to_json,
             headers: json_headers

        # Grape returns 400 for empty array validation failure
        expect(response).to have_http_status(:unprocessable_content)
      end

      it "returns error when ingredient_ids is missing" do
        post "/api/v1/search/by-ingredients",
             params: {}.to_json,
             headers: json_headers

        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end

  describe "POST /api/v1/search/by-budget" do
    let(:category) { create(:category, name: "Main Dishes") }
    let(:other_category) { create(:category, name: "Desserts") }

    let!(:cheap_recipe) do
      create(:recipe, title: "Budget Meal", est_cost_cents: 2000, servings: 4, category: category)
    end

    let!(:medium_recipe) do
      create(:recipe, title: "Mid-Range Dish", est_cost_cents: 5000, servings: 4, category: category)
    end

    let!(:expensive_recipe) do
      create(:recipe, title: "Fancy Dinner", est_cost_cents: 15_000, servings: 4, category: other_category)
    end

    let!(:per_serving_recipe) do
      create(:recipe, title: "Family Feast", est_cost_cents: 8000, servings: 8, category: category)
    end

    context "when finding recipes within budget" do
      it "returns recipes that fit the budget" do
        post "/api/v1/search/by-budget",
             params: { budget_cents: 6000 }.to_json,
             headers: json_headers

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)

        titles = json[:data].pluck(:title)
        expect(titles).to include("Budget Meal", "Mid-Range Dish")
        expect(titles).not_to include("Fancy Dinner")
      end

      it "includes fits_budget flag for each recipe" do
        post "/api/v1/search/by-budget",
             params: { budget_cents: 3000 }.to_json,
             headers: json_headers

        json = JSON.parse(response.body, symbolize_names: true)

        budget_meal = json[:data].find { |r| r[:title] == "Budget Meal" }
        expect(budget_meal[:fits_budget]).to be true
      end
    end

    context "when returning remaining budget" do
      it "calculates remaining budget correctly" do
        post "/api/v1/search/by-budget",
             params: { budget_cents: 5000 }.to_json,
             headers: json_headers

        json = JSON.parse(response.body, symbolize_names: true)

        budget_meal = json[:data].find { |r| r[:title] == "Budget Meal" }
        expect(budget_meal[:remaining_budget_cents]).to eq(3000) # 5000 - 2000
      end

      it "returns 0 when recipe equals budget" do
        post "/api/v1/search/by-budget",
             params: { budget_cents: 2000 }.to_json,
             headers: json_headers

        json = JSON.parse(response.body, symbolize_names: true)

        budget_meal = json[:data].find { |r| r[:title] == "Budget Meal" }
        expect(budget_meal[:remaining_budget_cents]).to eq(0)
      end
    end

    context "when sorting by cost" do
      it "returns recipes sorted by cost ascending" do
        post "/api/v1/search/by-budget",
             params: { budget_cents: 20_000 }.to_json,
             headers: json_headers

        json = JSON.parse(response.body, symbolize_names: true)

        costs = json[:data].pluck(:est_cost_cents)
        expect(costs).to eq(costs.sort)
      end
    end

    context "when filtering by category" do
      it "returns only recipes from specified category" do
        post "/api/v1/search/by-budget",
             params: { budget_cents: 20_000, category_id: category.id }.to_json,
             headers: json_headers

        json = JSON.parse(response.body, symbolize_names: true)

        titles = json[:data].pluck(:title)
        expect(titles).to include("Budget Meal", "Mid-Range Dish", "Family Feast")
        expect(titles).not_to include("Fancy Dinner")
      end
    end

    context "when using pagination" do
      before do
        10.times do |i|
          create(:recipe, title: "Extra Budget Recipe #{i}", est_cost_cents: 1000 + (i * 100), servings: 4)
        end
      end

      it "returns paginated results" do
        post "/api/v1/search/by-budget",
             params: { budget_cents: 50_000, page: 1, per_page: 5 }.to_json,
             headers: json_headers

        json = JSON.parse(response.body, symbolize_names: true)

        expect(json[:data].length).to eq(5)
        expect(json[:meta][:page]).to eq(1)
        expect(json[:meta][:per_page]).to eq(5)
      end

      it "returns correct page of results" do
        post "/api/v1/search/by-budget",
             params: { budget_cents: 50_000, page: 2, per_page: 5 }.to_json,
             headers: json_headers

        json = JSON.parse(response.body, symbolize_names: true)

        expect(json[:meta][:page]).to eq(2)
        expect(json[:data].length).to be >= 1
      end
    end

    context "when calculating cost per serving" do
      it "considers servings parameter when filtering" do
        # Family Feast: 8000 cents / 8 servings = 1000 per serving
        # For 4 servings: 4 * 1000 = 4000 cents
        post "/api/v1/search/by-budget",
             params: { budget_cents: 4500, servings: 4 }.to_json,
             headers: json_headers

        json = JSON.parse(response.body, symbolize_names: true)

        titles = json[:data].pluck(:title)
        expect(titles).to include("Family Feast") # 4000 cents for 4 servings <= 4500
        expect(titles).to include("Budget Meal") # 2000 cents <= 4500
      end
    end

    context "when returning budget usage percentage" do
      it "calculates budget usage correctly" do
        post "/api/v1/search/by-budget",
             params: { budget_cents: 10_000 }.to_json,
             headers: json_headers

        json = JSON.parse(response.body, symbolize_names: true)

        budget_meal = json[:data].find { |r| r[:title] == "Budget Meal" }
        expect(budget_meal[:budget_usage_percentage]).to eq(20.0) # 2000/10000 * 100
      end
    end

    context "with validation errors" do
      it "returns error when budget_cents is missing" do
        post "/api/v1/search/by-budget",
             params: {}.to_json,
             headers: json_headers

        expect(response).to have_http_status(:unprocessable_content)
      end

      it "returns error when budget_cents is zero" do
        post "/api/v1/search/by-budget",
             params: { budget_cents: 0 }.to_json,
             headers: json_headers

        expect(response).to have_http_status(:unprocessable_content)
      end

      it "returns error when budget_cents is negative" do
        post "/api/v1/search/by-budget",
             params: { budget_cents: -100 }.to_json,
             headers: json_headers

        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end
end
