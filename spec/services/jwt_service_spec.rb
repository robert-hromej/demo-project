# frozen_string_literal: true

require "rails_helper"

RSpec.describe JwtService do
  describe ".encode" do
    it "encodes payload into JWT token" do
      payload = { user_id: 1, email: "test@example.com" }
      token = described_class.encode(payload: payload)

      expect(token).to be_a(String)
      expect(token.split(".").length).to eq(3)
    end

    it "includes expiration in payload" do
      payload = { user_id: 1 }
      token = described_class.encode(payload: payload, exp: 1.hour.from_now)
      decoded = JWT.decode(token, described_class::SECRET, true, algorithm: described_class::ALGORITHM).first

      expect(decoded["exp"]).to be_present
    end

    it "uses custom expiration time" do
      payload = { user_id: 1 }
      exp_time = 2.hours.from_now
      token = described_class.encode(payload: payload, exp: exp_time)
      decoded = JWT.decode(token, described_class::SECRET, true, algorithm: described_class::ALGORITHM).first

      expect(decoded["exp"]).to eq(exp_time.to_i)
    end
  end

  describe ".decode" do
    it "decodes valid JWT token" do
      payload = { user_id: 1, email: "test@example.com" }
      token = described_class.encode(payload: payload)
      decoded = described_class.decode(token: token)

      expect(decoded[:user_id]).to eq(1)
      expect(decoded[:email]).to eq("test@example.com")
    end

    it "returns nil for invalid token" do
      decoded = described_class.decode(token: "invalid.token.here")

      expect(decoded).to be_nil
    end

    it "returns nil for expired token" do
      payload = { user_id: 1 }
      token = described_class.encode(payload: payload, exp: 1.second.ago)
      decoded = described_class.decode(token: token)

      expect(decoded).to be_nil
    end

    it "returns hash with indifferent access" do
      payload = { user_id: 1 }
      token = described_class.encode(payload: payload)
      decoded = described_class.decode(token: token)

      expect(decoded["user_id"]).to eq(1)
      expect(decoded[:user_id]).to eq(1)
    end
  end
end
