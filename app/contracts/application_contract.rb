# frozen_string_literal: true

class ApplicationContract < Dry::Validation::Contract
  config.messages.backend = :i18n
  config.messages.top_namespace = "contracts"

  SORT_DIRECTIONS = ["asc", "desc"].freeze
  MAX_PER_PAGE = 100

  register_macro(:email_format) do
    key.failure(:invalid_email) unless value.match?(/\A[\w+\-.]+@[a-z\d-]+(\.[a-z\d-]+)*\.[a-z]+\z/i)
  end

  register_macro(:strong_password) do
    key.failure(:weak_password) unless value.length >= 8
  end
end
