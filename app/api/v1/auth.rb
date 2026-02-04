# frozen_string_literal: true

module Api
  module V1
    class Auth < BaseEndpoint
      resource :auth do
        desc "Register new user"
        params do
          requires :email, type: String
          requires :password, type: String
          requires :password_confirmation, type: String
          requires :name, type: String
        end
        post :register do
          result = ::Users::Create.call(params: declared(params))
          data = handle_result(result)
          present data, with: Entities::AuthEntity
        end

        desc "Login"
        params do
          requires :email, type: String
          requires :password, type: String
        end
        post :login do
          result = ::Users::Authenticate.call(params: declared(params))
          data = handle_result(result)
          present data, with: Entities::AuthEntity
        end

        desc "Get current user"
        get :me do
          authenticate!
          present current_user, with: Entities::UserEntity
        end
      end
    end
  end
end
