# frozen_string_literal: true

require "simplecov" if ENV["COVERAGE"]

RSpec.configure do |config|
  # Enable flags like --only-failures and --next-failure
  config.example_status_persistence_file_path = "tmp/rspec_examples.txt"

  # Disable RSpec exposing methods globally on `Module` and `main`
  config.disable_monkey_patching!

  config.expect_with :rspec do |c|
    c.syntax = :expect
  end

  # Run specs in random order to surface order dependencies
  config.order = :random

  # Seed global randomization in this process using the `--seed` CLI option
  Kernel.srand config.seed

  # Allow filtering by focus
  config.filter_run_when_matching :focus

  # Print the 10 slowest examples and example groups at the end of the spec run
  config.profile_examples = 10 if ENV["PROFILE"]

  # Shared context metadata behavior
  config.shared_context_metadata_behavior = :apply_to_host_groups
end
