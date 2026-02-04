# frozen_string_literal: true

module Api
  module Entities
    class AuthEntity < Grape::Entity
      expose :user, using: UserEntity
      expose :token
    end
  end
end
