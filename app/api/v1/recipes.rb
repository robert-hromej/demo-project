# frozen_string_literal: true

module Api
  module V1
    class Recipes < BaseEndpoint
      resource :recipes do
        desc "List recipes with filtering"
        params do
          optional :query, type: String
          optional :category_id, type: Integer
          optional :difficulty, type: String, values: ["easy", "medium", "hard"]
          optional :max_cost, type: Integer
          optional :max_prep_time, type: Integer
          optional :min_rating, type: BigDecimal
          optional :sort, type: String, values: ["rating", "cost", "time", "created_at"]
          optional :order, type: String, values: ["asc", "desc"], default: "desc"
          optional :page, type: Integer, default: 1
          optional :per_page, type: Integer, default: 20
        end
        get do
          result = ::Recipes::Search.call(params: declared(params, include_missing: false))
          data = handle_result(result)
          {
            data: Entities::RecipeEntity.represent(data[:recipes]),
            meta: data[:meta],
          }
        end

        desc "Get recipe by ID"
        params do
          requires :id, type: Integer
        end
        get ":id" do
          recipe = Recipe.includes(:category, recipe_ingredients: :ingredient).find(params[:id])
          present recipe, with: Entities::RecipeEntity, full: true
        end

        desc "Create recipe"
        params do
          requires :title, type: String
          optional :description, type: String
          requires :instructions, type: String
          optional :category_id, type: Integer
          requires :prep_time_min, type: Integer
          requires :cook_time_min, type: Integer
          optional :servings, type: Integer
          optional :difficulty, type: String
          optional :ingredients, type: Array do
            requires :ingredient_id, type: Integer
            requires :quantity, type: BigDecimal
            requires :unit, type: String
            optional :notes, type: String
            optional :optional, type: Boolean
          end
        end
        post do
          authenticate!
          result = ::Recipes::Create.call(params: declared(params, include_missing: false))
          recipe = handle_result(result)
          present recipe, with: Entities::RecipeEntity, full: true
        end

        desc "Update recipe"
        params do
          requires :id, type: Integer
          optional :title, type: String
          optional :description, type: String
          optional :instructions, type: String
          optional :category_id, type: Integer
          optional :prep_time_min, type: Integer
          optional :cook_time_min, type: Integer
          optional :servings, type: Integer
          optional :difficulty, type: String
          optional :ingredients, type: Array do
            requires :ingredient_id, type: Integer
            requires :quantity, type: BigDecimal
            requires :unit, type: String
            optional :notes, type: String
            optional :optional, type: Boolean
          end
        end
        put ":id" do
          authenticate!
          result = ::Recipes::Update.call(id: params[:id], params: declared(params, include_missing: false).except(:id))
          updated = handle_result(result)
          present updated, with: Entities::RecipeEntity, full: true
        end

        desc "Delete recipe"
        params do
          requires :id, type: Integer
        end
        delete ":id" do
          authenticate!
          result = ::Recipes::Delete.call(id: params[:id])
          handle_result(result)
          status 204
          body false
        end
      end
    end
  end
end
