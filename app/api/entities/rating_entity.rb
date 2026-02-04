# frozen_string_literal: true

module Api
  module Entities
    class RatingEntity < Grape::Entity
      expose :id
      expose :score
      expose :review
      expose :user, using: UserEntity
      expose :created_at
    end
  end
end
