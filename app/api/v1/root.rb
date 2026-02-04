# frozen_string_literal: true

module Api
  module V1
    class Root < Grape::API
      version "v1", using: :path

      mount Api::V1::Health
      mount Api::V1::Auth
      mount Api::V1::Categories
      mount Api::V1::Ingredients
      mount Api::V1::Recipes
      mount Api::V1::Ratings
      mount Api::V1::Search
    end
  end
end
