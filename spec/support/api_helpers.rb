# frozen_string_literal: true

module ApiHelpers
  def json_response
    @json_response ||= JSON.parse(response.body, symbolize_names: true)
  end

  def json_body
    JSON.parse(last_response.body, symbolize_names: true)
  end

  def auth_headers(token:)
    { "Authorization" => "Bearer #{token}" }
  end

  def json_headers
    { "Content-Type" => "application/json", "Accept" => "application/json" }
  end

  def authenticated_headers(token:)
    json_headers.merge(auth_headers(token: token))
  end
end

RSpec.configure do |config|
  config.include ApiHelpers, type: :request
  config.include ApiHelpers, type: :api
end
