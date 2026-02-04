# frozen_string_literal: true

module Api
  module Entities
    class BaseEntity < Grape::Entity
      format_with(:iso_timestamp) { |dt| dt&.iso8601 }

      expose :id
      expose :created_at, format_with: :iso_timestamp
      expose :updated_at, format_with: :iso_timestamp
    end
  end
end
