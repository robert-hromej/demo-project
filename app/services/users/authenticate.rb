# frozen_string_literal: true

module Users
  class Authenticate < ApplicationService
    def call(params:)
      validated = yield validate(contract_class: Users::LoginContract, params: params)
      user = yield find_user(email: validated[:email])
      yield verify_password(user: user, password: validated[:password])
      token = generate_token(user: user)

      Success(user: user, token: token)
    end

    private

    def find_user(email:)
      user = User.find_by(email: email.downcase)
      return Success(user) if user

      Failure(unauthorized_error(message: "Invalid email or password"))
    end

    def verify_password(user:, password:)
      if user.authenticate(password)
        Success(true)
      else
        Failure(unauthorized_error(message: "Invalid email or password"))
      end
    end

    def generate_token(user:)
      JwtService.encode(payload: { user_id: user.id, email: user.email })
    end
  end
end
