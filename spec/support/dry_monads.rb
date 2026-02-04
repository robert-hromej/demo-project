# frozen_string_literal: true

require "dry/monads"

# Custom matchers for Dry::Monads::Result
RSpec::Matchers.define :be_success do |expected_value = nil|
  match do |actual|
    return false unless actual.is_a?(Dry::Monads::Result::Success)
    return true if expected_value.nil?

    actual.value! == expected_value
  end

  failure_message do |actual|
    if actual.is_a?(Dry::Monads::Result::Success)
      "expected Success(#{expected_value.inspect}) but got Success(#{actual.value!.inspect})"
    else
      "expected Success but got Failure(#{actual.failure.inspect})"
    end
  end

  failure_message_when_negated do |actual|
    "expected not to be Success but got Success(#{actual.value!.inspect})"
  end
end

RSpec::Matchers.define :be_failure do |expected_value = nil|
  match do |actual|
    return false unless actual.is_a?(Dry::Monads::Result::Failure)
    return true if expected_value.nil?

    actual.failure == expected_value
  end

  failure_message do |actual|
    if actual.is_a?(Dry::Monads::Result::Failure)
      "expected Failure(#{expected_value.inspect}) but got Failure(#{actual.failure.inspect})"
    else
      "expected Failure but got Success(#{actual.value!.inspect})"
    end
  end

  failure_message_when_negated do |actual|
    "expected not to be Failure but got Failure(#{actual.failure.inspect})"
  end
end

RSpec::Matchers.define :have_success_value do |expected|
  match do |actual|
    actual.is_a?(Dry::Monads::Result::Success) && values_match?(expected, actual.value!)
  end

  failure_message do |actual|
    if actual.is_a?(Dry::Monads::Result::Success)
      "expected Success value to match #{expected.inspect}, but got #{actual.value!.inspect}"
    else
      "expected Success but got Failure(#{actual.failure.inspect})"
    end
  end
end

RSpec::Matchers.define :have_failure_value do |expected|
  match do |actual|
    actual.is_a?(Dry::Monads::Result::Failure) && values_match?(expected, actual.failure)
  end

  failure_message do |actual|
    if actual.is_a?(Dry::Monads::Result::Failure)
      "expected Failure value to match #{expected.inspect}, but got #{actual.failure.inspect}"
    else
      "expected Failure but got Success(#{actual.value!.inspect})"
    end
  end
end
