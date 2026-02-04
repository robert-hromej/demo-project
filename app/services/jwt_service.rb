# frozen_string_literal: true

class JwtService
  SECRET = Rails.application.secret_key_base
  ALGORITHM = "HS256"

  class << self
    def encode(payload:, exp: 24.hours.from_now)
      payload[:exp] = exp.to_i
      JWT.encode(payload, SECRET, ALGORITHM)
    end

    def decode(token:)
      JWT.decode(token, SECRET, true, algorithm: ALGORITHM).first.with_indifferent_access
    rescue JWT::DecodeError, JWT::ExpiredSignature
      nil
    end
  end
end
