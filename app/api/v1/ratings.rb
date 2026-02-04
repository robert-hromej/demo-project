# frozen_string_literal: true

module Api
  module V1
    class Ratings < BaseEndpoint
      rescue_from ActiveRecord::RecordNotFound do |e|
        error!({ error: { code: :not_found, message: e.message } }, 404)
      end

      namespace "recipes/:recipe_id" do
        resource :ratings do
          desc "List ratings for recipe"
          params do
            optional :page, type: Integer, default: 1
            optional :per_page, type: Integer, default: 20
          end
          get do
            recipe = Recipe.find(params[:recipe_id])
            ratings = recipe.ratings.includes(:user).order(created_at: :desc)
            paginated = paginate(collection: ratings, page: params[:page], per_page: params[:per_page])
            {
              data: Entities::RatingEntity.represent(paginated[:data]),
              meta: paginated[:meta].merge(average_score: recipe.avg_rating),
            }
          end

          desc "Create or update rating"
          params do
            requires :score, type: Integer, values: 1..5
            optional :review, type: String
          end
          post do
            authenticate!
            result = ::Ratings::Create.call(
              recipe_id: params[:recipe_id],
              user: current_user,
              params: declared(params, include_missing: false).except(:recipe_id),
            )
            rating = handle_result(result)
            present rating, with: Entities::RatingEntity
          end

          desc "Delete rating"
          delete do
            authenticate!
            result = ::Ratings::Delete.call(
              recipe_id: params[:recipe_id],
              user: current_user,
            )
            handle_result(result)
            status 204
            body false
          end
        end
      end
    end
  end
end
