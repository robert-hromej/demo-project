# frozen_string_literal: true

module Api
  module V1
    class Ingredients < BaseEndpoint
      resource :ingredients do
        desc "List ingredients with search"
        params do
          optional :query, type: String
          optional :category, type: String
          optional :page, type: Integer, default: 1
          optional :per_page, type: Integer, default: 20
        end
        get do
          result = ::Ingredients::Search.call(params: declared(params, include_missing: false))
          data = handle_result(result)
          {
            data: Entities::IngredientEntity.represent(data[:ingredients]),
            meta: data[:meta],
          }
        end

        desc "Get ingredient by ID"
        params do
          requires :id, type: Integer
        end
        get ":id" do
          ingredient = Ingredient.find(params[:id])
          present ingredient, with: Entities::IngredientEntity
        end

        desc "Create ingredient"
        params do
          requires :name, type: String
          requires :name_uk, type: String
          optional :default_unit, type: String
          optional :category, type: String
          optional :unit_price_cents, type: Integer
        end
        post do
          authenticate!
          result = ::Ingredients::Create.call(params: declared(params, include_missing: false))
          ingredient = handle_result(result)
          present ingredient, with: Entities::IngredientEntity
        end

        desc "Update ingredient"
        params do
          requires :id, type: Integer
          optional :name, type: String
          optional :name_uk, type: String
          optional :default_unit, type: String
          optional :category, type: String
          optional :unit_price_cents, type: Integer
        end
        put ":id" do
          authenticate!
          ingredient = Ingredient.find(params[:id])
          result = ::Ingredients::Update.call(ingredient: ingredient,
                                              params: declared(params,
                                                               include_missing: false,).except(:id),)
          updated = handle_result(result)
          present updated, with: Entities::IngredientEntity
        end

        desc "Delete ingredient"
        params do
          requires :id, type: Integer
        end
        delete ":id" do
          authenticate!
          ingredient = Ingredient.find(params[:id])
          result = ::Ingredients::Delete.call(ingredient: ingredient)
          handle_result(result)
          status 204
          body false
        end
      end
    end
  end
end
