# frozen_string_literal: true

SimpleCov.start "rails" do
  enable_coverage :branch
  minimum_coverage line: 95, branch: 85
  minimum_coverage_by_file 70

  add_group "API", "app/api"
  add_group "Contracts", "app/contracts"
  add_group "Services", "app/services"
  add_group "Models", "app/models"

  track_files "{app/api,app/contracts,app/models,app/services,lib}/**/*.rb"
  coverage_dir "tmp/coverage"
end
