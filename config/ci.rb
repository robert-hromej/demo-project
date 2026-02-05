# Run using bin/ci

CI.run do
  step "Setup", "bin/setup --skip-server"

  step "Style: Ruby", "bin/rubocop"
  step "Style: Frontend", "npx eslint app/frontend"

  step "Security: Gem audit", "bin/bundler-audit"
  step "Security: Brakeman code analysis", "bin/brakeman --quiet --no-pager --exit-on-warn --exit-on-error -i config/brakeman.ignore"

  step "TypeScript: Type check", "npx tsc --noEmit"

  step "Tests: RSpec", "bundle exec rspec"
  step "Tests: Frontend", "npx vitest run"
  step "Tests: Seeds", "env RAILS_ENV=test bin/rails db:seed:replant"
end
