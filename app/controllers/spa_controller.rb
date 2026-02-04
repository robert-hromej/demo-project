# frozen_string_literal: true

class SpaController < ApplicationController
  def index
    render html: "", layout: "application"
  end
end
