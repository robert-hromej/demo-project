# frozen_string_literal: true

module Api
  class Root < Grape::API
    format :json
    prefix :api

    rescue_from ActiveRecord::RecordNotFound do |e|
      error!({ error: { code: :not_found, message: e.message } }, 404)
    end

    rescue_from Grape::Exceptions::ValidationErrors do |e|
      error!({ error: { code: :validation_error, message: e.message, details: e.as_json } }, 422)
    end

    mount Api::V1::Root
  end
end
