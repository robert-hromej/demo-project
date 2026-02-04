# frozen_string_literal: true

module Api
  class BaseEndpoint < Grape::API
    format :json

    # Include helpers in each endpoint that inherits from BaseEndpoint
    # Note: In Grape, helpers don't automatically inherit through class inheritance,
    # so each subclass must include the helpers module explicitly.
    # This is done automatically when inheriting from BaseEndpoint.

    def self.inherited(subclass)
      super
      subclass.helpers Api::Helpers::ApiHelpers
    end

    helpers Api::Helpers::ApiHelpers

    rescue_from ActiveRecord::RecordNotFound do |e|
      error!({ error: { code: :not_found, message: e.message } }, 404)
    end

    rescue_from Grape::Exceptions::ValidationErrors do |e|
      error!({ error: { code: :validation_error, message: e.message, details: e.as_json } }, 422)
    end
  end
end
