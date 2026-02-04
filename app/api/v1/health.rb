# frozen_string_literal: true

module Api
  module V1
    class Health < BaseEndpoint
      resource :health do
        desc "Health check"
        get do
          { status: "ok", version: "v1" }
        end
      end
    end
  end
end
