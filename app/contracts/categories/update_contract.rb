# frozen_string_literal: true

module Categories
  class UpdateContract < ApplicationContract
    params do
      optional(:name).filled(:string, max_size?: 100)
      optional(:description).maybe(:string)
      optional(:parent_id).maybe(:integer)
      optional(:position).maybe(:integer)
    end

    rule(:parent_id) do
      key.failure(:not_found) if value && !Category.exists?(value)
    end
  end
end
