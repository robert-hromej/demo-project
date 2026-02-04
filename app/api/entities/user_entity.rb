# frozen_string_literal: true

module Api
  module Entities
    class UserEntity < Grape::Entity
      expose :id
      expose :email
      expose :name
      expose :avatar_url
      expose :created_at
    end
  end
end
