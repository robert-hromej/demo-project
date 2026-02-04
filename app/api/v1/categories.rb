# frozen_string_literal: true

module Api
  module V1
    class Categories < BaseEndpoint
      resource :categories do
        desc "List all categories"
        params do
          optional :include_children, type: Boolean, default: false
        end
        get do
          categories = Category.roots
          present categories, with: Entities::CategoryEntity, include_children: params[:include_children]
        end

        desc "Get category by ID"
        params do
          requires :id, type: Integer
        end
        get ":id" do
          category = Category.find(params[:id])
          present category, with: Entities::CategoryEntity, include_children: true, include_parent: true
        end

        desc "Create category"
        params do
          requires :name, type: String
          optional :description, type: String
          optional :parent_id, type: Integer
          optional :position, type: Integer
        end
        post do
          authenticate!
          result = ::Categories::Create.call(params: declared(params, include_missing: false))
          category = handle_result(result)
          present category, with: Entities::CategoryEntity
        end

        desc "Update category"
        params do
          requires :id, type: Integer
          optional :name, type: String
          optional :description, type: String
          optional :parent_id, type: Integer
          optional :position, type: Integer
        end
        put ":id" do
          authenticate!
          category = Category.find(params[:id])
          result = ::Categories::Update.call(category: category,
                                             params: declared(params,
                                                              include_missing: false,).except(:id),)
          updated = handle_result(result)
          present updated, with: Entities::CategoryEntity
        end

        desc "Delete category"
        params do
          requires :id, type: Integer
        end
        delete ":id" do
          authenticate!
          category = Category.find(params[:id])
          result = ::Categories::Delete.call(category: category)
          handle_result(result)
          status 204
          body false
        end
      end
    end
  end
end
