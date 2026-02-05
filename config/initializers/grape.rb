# frozen_string_literal: true

# Grape API configuration
# Exclude app/api from Zeitwerk: files use Api:: namespace which conflicts
# with Zeitwerk expectations (app/api/ is an autoload root, so it expects no Api:: prefix).
Rails.autoloaders.main.ignore(Rails.root.join("app/api"))

# Explicitly require all API files in proper order:
# helpers first, then base classes, then entities, then endpoints
[
  "app/api/helpers/api_helpers.rb",
  "app/api/base_endpoint.rb",
  "app/api/entities/base_entity.rb",
  "app/api/entities/user_entity.rb",
  "app/api/entities/category_entity.rb",
  "app/api/entities/ingredient_entity.rb",
  "app/api/entities/recipe_ingredient_entity.rb",
  "app/api/entities/recipe_entity.rb",
  "app/api/entities/rating_entity.rb",
  "app/api/entities/auth_entity.rb",
  "app/api/v1/health.rb",
  "app/api/v1/auth.rb",
  "app/api/v1/categories.rb",
  "app/api/v1/ingredients.rb",
  "app/api/v1/recipes.rb",
  "app/api/v1/ratings.rb",
  "app/api/v1/search.rb",
  "app/api/v1/root.rb",
  "app/api/root.rb",
].each { |f| require Rails.root.join(f) }
