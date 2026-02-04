# frozen_string_literal: true

module Ratings
  class CreateContract < ApplicationContract
    params do
      required(:score).filled(:integer, gteq?: 1, lteq?: 5)
      optional(:review).maybe(:string)
    end
  end
end
