# frozen_string_literal: true

module Api
  module Entities
    class CategoryEntity < Grape::Entity
      expose :id
      expose :name
      expose :description
      expose :image_url
      expose :position
      expose :recipes_count
      expose :children, using: CategoryEntity, if: ->(_cat, opts) { opts[:include_children] } do |cat, _opts|
        cat.children
      end
      expose :parent, if: ->(cat, opts) { opts[:include_parent] && cat.parent } do |cat, _opts|
        {
          id: cat.parent.id,
          name: cat.parent.name,
          description: cat.parent.description,
          position: cat.parent.position,
        }
      end
    end
  end
end
