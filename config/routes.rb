# frozen_string_literal: true

Rails.application.routes.draw do
  mount Api::Root => "/"

  get "up" => "rails/health#show", as: :rails_health_check

  # SPA catch-all route - must be last
  get "*path", to: "spa#index", constraints: ->(req) { !req.path.start_with?("/api") }
  root "spa#index"
end
