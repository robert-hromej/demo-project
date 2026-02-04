# frozen_string_literal: true

module Users
  class Create < ApplicationService
    def call(params:)
      validated = yield validate(contract_class: Users::CreateContract, params: params)
      user = yield create_user(params: validated)
      token = generate_token(user: user)

      Success(user: user, token: token)
    end

    private

    def create_user(params:)
      user = User.new(
        email: params[:email],
        password: params[:password],
        name: params[:name],
        avatar_url: params[:avatar_url],
      )

      if user.save
        Success(user)
      else
        Failure(validation_error(errors: user.errors.messages))
      end
    end

    def generate_token(user:)
      JwtService.encode(payload: { user_id: user.id, email: user.email })
    end
  end
end
