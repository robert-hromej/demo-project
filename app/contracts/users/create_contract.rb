# frozen_string_literal: true

module Users
  class CreateContract < ApplicationContract
    params do
      required(:email).filled(:string)
      required(:password).filled(:string)
      required(:password_confirmation).filled(:string)
      required(:name).filled(:string, max_size?: 100)
    end

    rule(:email).validate(:email_format)
    rule(:password).validate(:strong_password)

    rule(:password_confirmation) do
      key.failure(:passwords_dont_match) if values[:password] != values[:password_confirmation]
    end

    rule(:email) do
      key.failure(:already_taken) if User.exists?(email: value.downcase)
    end
  end
end
