# frozen_string_literal: true

class ApplicationService
  include Dry::Monads[:result, :do]

  class << self
    def call(...)
      new.call(...)
    end
  end

  private

  def validate(contract_class:, params:)
    result = contract_class.new.call(params)

    if result.success?
      Success(result.to_h)
    else
      Failure(validation_error(errors: result.errors.to_h))
    end
  end

  def validation_error(errors:)
    {
      code: :validation_error,
      message: "Validation failed",
      details: errors,
    }
  end

  def not_found_error(resource:)
    {
      code: :not_found,
      message: "#{resource} not found",
    }
  end

  def unauthorized_error(message: "Unauthorized")
    {
      code: :unauthorized,
      message: message,
    }
  end
end
