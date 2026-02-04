# frozen_string_literal: true

module Users
  class LoginContract < ApplicationContract
    params do
      required(:email).filled(:string)
      required(:password).filled(:string)
    end
  end
end
