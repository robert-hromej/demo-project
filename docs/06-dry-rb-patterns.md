# Патерни dry-rb

## Огляд

RecipeMatch використовує геми dry-rb для чистої, функціональної бізнес-логіки:

- **dry-monads** - Railway-орієнтоване програмування з монадою Result
- **dry-validation** - Декларативна валідація вхідних даних

```
┌─────────────────────────────────────────────────┐
│                   Потік запиту                   │
├─────────────────────────────────────────────────┤
│                                                  │
│   API Endpoint                                   │
│        │                                         │
│        ▼                                         │
│   Contract (dry-validation)                      │
│        │                                         │
│        ├── Failure ──► Відповідь з помилкою      │
│        │                                         │
│        ▼ Success                                 │
│   Service (dry-monads)                           │
│        │                                         │
│        ├── Failure ──► Відповідь з помилкою      │
│        │                                         │
│        ▼ Success                                 │
│   Успішна відповідь                              │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Контракти dry-validation

### Базовий контракт

```ruby
# app/contracts/application_contract.rb
class ApplicationContract < Dry::Validation::Contract
  config.messages.backend = :i18n
  config.messages.top_namespace = 'contracts'

  # Загальні предикати
  register_macro(:email_format) do
    key.failure(:invalid_email) unless value.match?(/\A[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+\z/i)
  end

  register_macro(:strong_password) do
    key.failure(:weak_password) unless value.length >= 8
  end
end
```

### Приклади контрактів

#### Контракт реєстрації користувача

```ruby
# app/contracts/users/create_contract.rb
module Users
  class CreateContract < ApplicationContract
    params do
      required(:email).filled(:string)
      required(:password).filled(:string)
      required(:password_confirmation).filled(:string)
      required(:name).filled(:string, max_size?: 100)
      optional(:avatar_url).maybe(:string)
    end

    rule(:email).validate(:email_format)
    rule(:password).validate(:strong_password)

    rule(:password_confirmation) do
      key.failure(:passwords_dont_match) if values[:password] != values[:password_confirmation]
    end

    rule(:email) do
      key.failure(:already_taken) if User.exists?(email: value)
    end
  end
end
```

#### Контракт створення рецепту

```ruby
# app/contracts/recipes/create_contract.rb
module Recipes
  class CreateContract < ApplicationContract
    params do
      required(:title).filled(:string, max_size?: 255)
      required(:instructions).filled(:string)
      required(:prep_time_min).filled(:integer, gt?: 0)
      required(:cook_time_min).filled(:integer, gteq?: 0)
      optional(:description).maybe(:string)
      optional(:category_id).maybe(:integer)
      optional(:servings).filled(:integer, gt?: 0)
      optional(:difficulty).filled(:string, included_in?: %w[easy medium hard])
      optional(:image_url).maybe(:string)
      optional(:ingredients).array(:hash) do
        required(:ingredient_id).filled(:integer)
        required(:quantity).filled(:decimal, gt?: 0)
        required(:unit).filled(:string)
        optional(:notes).maybe(:string)
        optional(:optional).filled(:bool)
      end
    end

    rule(:category_id) do
      key.failure(:not_found) if value && !Category.exists?(value)
    end

    rule(:ingredients) do
      if value
        ingredient_ids = value.map { |i| i[:ingredient_id] }
        existing_ids = Ingredient.where(id: ingredient_ids).pluck(:id)
        missing = ingredient_ids - existing_ids
        key.failure(:ingredients_not_found, missing: missing) if missing.any?
      end
    end
  end
end
```

#### Контракт пошуку за інгредієнтами

```ruby
# app/contracts/recipes/search_by_ingredients_contract.rb
module Recipes
  class SearchByIngredientsContract < ApplicationContract
    params do
      required(:ingredient_ids).filled(:array).each(:integer)
      optional(:match_percentage).filled(:integer, gteq?: 1, lteq?: 100)
      optional(:include_optional).filled(:bool)
      optional(:category_id).maybe(:integer)
      optional(:max_cost).maybe(:integer, gt?: 0)
      optional(:sort).filled(:string, included_in?: %w[match_percentage cost rating time])
      optional(:order).filled(:string, included_in?: %w[asc desc])
      optional(:page).filled(:integer, gt?: 0)
      optional(:per_page).filled(:integer, gt?: 0, lteq?: 100)
    end

    rule(:ingredient_ids) do
      if value.empty?
        key.failure(:at_least_one_required)
      elsif value.length > 50
        key.failure(:too_many_ingredients)
      end
    end
  end
end
```

---

## Сервіси dry-monads

### Базовий сервіс

```ruby
# app/services/application_service.rb
class ApplicationService
  include Dry::Monads[:result, :do]

  class << self
    def call(...)
      new.call(...)
    end
  end

  private

  def validate(contract_class, params)
    result = contract_class.new.call(params)

    if result.success?
      Success(result.to_h)
    else
      Failure(validation_error(result.errors.to_h))
    end
  end

  def validation_error(errors)
    {
      code: :validation_error,
      message: 'Validation failed',
      details: errors
    }
  end

  def not_found_error(resource)
    {
      code: :not_found,
      message: "#{resource} not found"
    }
  end

  def unauthorized_error(message = 'Unauthorized')
    {
      code: :unauthorized,
      message: message
    }
  end
end
```

### Приклади сервісів

#### Сервіс створення користувача

```ruby
# app/services/users/create.rb
module Users
  class Create < ApplicationService
    def call(params:)
      validated = yield validate(Users::CreateContract, params)
      user = yield create_user(validated)

      Success(user)
    end

    private

    def create_user(params)
      user = User.new(
        email: params[:email],
        password: params[:password],
        name: params[:name],
        avatar_url: params[:avatar_url]
      )

      if user.save
        Success(user)
      else
        Failure(validation_error(user.errors.messages))
      end
    end
  end
end
```

#### Сервіс створення рецепту

```ruby
# app/services/recipes/create.rb
module Recipes
  class Create < ApplicationService
    def call(params:, user: nil)
      validated = yield validate(Recipes::CreateContract, params)
      recipe = yield create_recipe(validated)
      yield create_ingredients(recipe, validated[:ingredients]) if validated[:ingredients]
      yield calculate_cost(recipe)

      Success(recipe.reload)
    end

    private

    def create_recipe(params)
      recipe = Recipe.new(
        title: params[:title],
        description: params[:description],
        instructions: params[:instructions],
        category_id: params[:category_id],
        prep_time_min: params[:prep_time_min],
        cook_time_min: params[:cook_time_min],
        servings: params[:servings] || 4,
        difficulty: params[:difficulty] || 'easy',
        image_url: params[:image_url]
      )

      if recipe.save
        Success(recipe)
      else
        Failure(validation_error(recipe.errors.messages))
      end
    end

    def create_ingredients(recipe, ingredients)
      ingredients.each do |ing|
        RecipeIngredient.create!(
          recipe: recipe,
          ingredient_id: ing[:ingredient_id],
          quantity: ing[:quantity],
          unit: ing[:unit],
          notes: ing[:notes],
          optional: ing[:optional] || false
        )
      end

      Success(true)
    rescue ActiveRecord::RecordInvalid => e
      Failure(validation_error(e.record.errors.messages))
    end

    def calculate_cost(recipe)
      Recipes::CalculateCost.call(recipe: recipe)
    end
  end
end
```

#### Сервіс пошуку за інгредієнтами

```ruby
# app/services/recipes/search_by_ingredients.rb
module Recipes
  class SearchByIngredients < ApplicationService
    def call(params:)
      validated = yield validate(Recipes::SearchByIngredientsContract, params)
      recipes = yield find_matching_recipes(validated)
      paginated = yield paginate(recipes, validated)

      Success(paginated)
    end

    private

    def find_matching_recipes(params)
      ingredient_ids = params[:ingredient_ids]
      match_percentage = params[:match_percentage] || 80
      include_optional = params[:include_optional] || false

      # Побудова запиту
      query = Recipe
        .select(
          'recipes.*',
          'COUNT(recipe_ingredients.id) AS total_ingredients',
          'COUNT(CASE WHEN recipe_ingredients.ingredient_id IN (?) THEN 1 END) AS matched_ingredients',
          'ROUND(COUNT(CASE WHEN recipe_ingredients.ingredient_id IN (?) THEN 1 END)::numeric / COUNT(recipe_ingredients.id) * 100, 2) AS match_percentage'
        )
        .joins(:recipe_ingredients)
        .group('recipes.id')
        .having('COUNT(CASE WHEN recipe_ingredients.ingredient_id IN (?) THEN 1 END)::numeric / COUNT(recipe_ingredients.id) * 100 >= ?', match_percentage)

      # Застосування фільтру опціональних інгредієнтів
      unless include_optional
        query = query.where(recipe_ingredients: { optional: false })
      end

      # Застосування фільтру категорії
      if params[:category_id]
        query = query.where(category_id: params[:category_id])
      end

      # Застосування фільтру вартості
      if params[:max_cost]
        query = query.where('est_cost_cents <= ?', params[:max_cost])
      end

      # Застосування сортування
      query = apply_sorting(query, params[:sort], params[:order])

      Success(query)
    rescue StandardError => e
      Failure(code: :search_error, message: e.message)
    end

    def apply_sorting(query, sort, order)
      sort ||= 'match_percentage'
      order ||= 'desc'

      case sort
      when 'match_percentage'
        query.order("match_percentage #{order}")
      when 'cost'
        query.order("est_cost_cents #{order}")
      when 'rating'
        query.order("avg_rating #{order}")
      when 'time'
        query.order("(prep_time_min + cook_time_min) #{order}")
      else
        query.order("match_percentage #{order}")
      end
    end

    def paginate(recipes, params)
      page = params[:page] || 1
      per_page = params[:per_page] || 20

      pagy, records = pagy(recipes, page: page, limit: per_page)

      Success({
        recipes: records,
        meta: {
          page: pagy.page,
          per_page: pagy.limit,
          total: pagy.count,
          total_pages: pagy.pages
        }
      })
    end
  end
end
```

#### Сервіс перерахунку рейтингу

```ruby
# app/services/ratings/recalculate_average.rb
module Ratings
  class RecalculateAverage < ApplicationService
    def call(recipe:)
      stats = calculate_stats(recipe)
      update_recipe(recipe, stats)

      Success(recipe.reload)
    end

    private

    def calculate_stats(recipe)
      recipe.ratings.select(
        'AVG(score) as avg_score',
        'COUNT(*) as count'
      ).first
    end

    def update_recipe(recipe, stats)
      recipe.update!(
        avg_rating: stats.avg_score || 0,
        ratings_count: stats.count
      )

      Success(true)
    rescue ActiveRecord::RecordInvalid => e
      Failure(validation_error(e.record.errors.messages))
    end
  end
end
```

---

## Структура директорії сервісів

```
app/services/
├── application_service.rb        # Базовий клас
├── users/
│   ├── create.rb                 # Реєстрація користувача
│   ├── authenticate.rb           # Вхід
│   └── update.rb                 # Оновлення профілю
├── categories/
│   ├── create.rb
│   ├── update.rb
│   └── delete.rb
├── ingredients/
│   ├── create.rb
│   ├── update.rb
│   └── delete.rb
├── recipes/
│   ├── create.rb
│   ├── update.rb
│   ├── delete.rb
│   ├── search.rb                 # Загальний пошук
│   ├── search_by_ingredients.rb  # Пошук за інгредієнтами
│   ├── search_by_budget.rb       # Пошук за бюджетом
│   └── calculate_cost.rb         # Розрахунок вартості
└── ratings/
    ├── create.rb
    ├── delete.rb
    └── recalculate_average.rb
```

---

## Структура директорії контрактів

```
app/contracts/
├── application_contract.rb       # Базовий клас
├── users/
│   ├── create_contract.rb
│   └── update_contract.rb
├── categories/
│   ├── create_contract.rb
│   └── update_contract.rb
├── ingredients/
│   ├── create_contract.rb
│   └── update_contract.rb
├── recipes/
│   ├── create_contract.rb
│   ├── update_contract.rb
│   ├── search_contract.rb
│   ├── search_by_ingredients_contract.rb
│   └── search_by_budget_contract.rb
└── ratings/
    └── create_contract.rb
```

---

## Тестування коду dry-rb

### Специфікації контрактів

```ruby
# spec/contracts/recipes/create_contract_spec.rb
RSpec.describe Recipes::CreateContract do
  subject(:contract) { described_class.new }

  describe 'валідація параметрів' do
    let(:valid_params) do
      {
        title: 'Омлет',
        instructions: 'Змішайте яйця з молоком',
        prep_time_min: 5,
        cook_time_min: 10
      }
    end

    context 'з валідними параметрами' do
      it 'проходить успішно' do
        result = contract.call(valid_params)
        expect(result).to be_success
      end
    end

    context 'без назви' do
      it 'завершується невдачею' do
        result = contract.call(valid_params.except(:title))
        expect(result).to be_failure
        expect(result.errors[:title]).to include('is missing')
      end
    end

    context 'з невалідним prep_time_min' do
      it 'завершується невдачею коли нуль' do
        result = contract.call(valid_params.merge(prep_time_min: 0))
        expect(result).to be_failure
        expect(result.errors[:prep_time_min]).to include('must be greater than 0')
      end

      it 'завершується невдачею коли від\'ємне' do
        result = contract.call(valid_params.merge(prep_time_min: -5))
        expect(result).to be_failure
      end
    end

    context 'з невалідною складністю' do
      it 'завершується невдачею з невідомою складністю' do
        result = contract.call(valid_params.merge(difficulty: 'extreme'))
        expect(result).to be_failure
        expect(result.errors[:difficulty]).to include('must be one of: easy, medium, hard')
      end
    end
  end

  describe 'валідація правил' do
    let(:valid_params) do
      {
        title: 'Омлет',
        instructions: 'Інструкції',
        prep_time_min: 5,
        cook_time_min: 10,
        category_id: category.id
      }
    end

    let!(:category) { create(:category) }

    context 'з неіснуючою категорією' do
      it 'завершується невдачею' do
        result = contract.call(valid_params.merge(category_id: 99999))
        expect(result).to be_failure
        expect(result.errors[:category_id]).to include('not found')
      end
    end
  end
end
```

### Специфікації сервісів

```ruby
# spec/services/recipes/create_spec.rb
RSpec.describe Recipes::Create do
  describe '.call' do
    let!(:category) { create(:category) }
    let!(:ingredient) { create(:ingredient) }

    let(:valid_params) do
      {
        title: 'Омлет з молоком',
        instructions: 'Змішайте яйця з молоком',
        prep_time_min: 5,
        cook_time_min: 10,
        category_id: category.id,
        ingredients: [
          {
            ingredient_id: ingredient.id,
            quantity: 3,
            unit: 'pcs'
          }
        ]
      }
    end

    context 'з валідними параметрами' do
      it 'створює рецепт' do
        expect {
          described_class.call(params: valid_params)
        }.to change(Recipe, :count).by(1)
      end

      it 'повертає монаду Success' do
        result = described_class.call(params: valid_params)
        expect(result).to be_success
        expect(result.value!).to be_a(Recipe)
      end

      it 'створює інгредієнти рецепту' do
        result = described_class.call(params: valid_params)
        recipe = result.value!
        expect(recipe.recipe_ingredients.count).to eq(1)
      end

      it 'розраховує орієнтовну вартість' do
        result = described_class.call(params: valid_params)
        recipe = result.value!
        expect(recipe.est_cost_cents).to be > 0
      end
    end

    context 'з невалідними параметрами' do
      it 'повертає монаду Failure' do
        result = described_class.call(params: { title: '' })
        expect(result).to be_failure
        expect(result.failure[:code]).to eq(:validation_error)
      end

      it 'не створює рецепт' do
        expect {
          described_class.call(params: { title: '' })
        }.not_to change(Recipe, :count)
      end
    end

    context 'з неіснуючим інгредієнтом' do
      let(:invalid_params) do
        valid_params.merge(
          ingredients: [{ ingredient_id: 99999, quantity: 1, unit: 'pcs' }]
        )
      end

      it 'повертає монаду Failure' do
        result = described_class.call(params: invalid_params)
        expect(result).to be_failure
        expect(result.failure[:details][:ingredients]).to be_present
      end
    end
  end
end
```

### Спільні приклади для сервісів

```ruby
# spec/support/shared_examples/service_examples.rb
RSpec.shared_examples 'успішний сервіс' do
  it 'повертає монаду Success' do
    expect(result).to be_success
  end
end

RSpec.shared_examples 'невдалий сервіс' do
  it 'повертає монаду Failure' do
    expect(result).to be_failure
  end

  it 'повертає деталі помилки' do
    expect(result.failure).to include(:code, :message)
  end
end

RSpec.shared_examples 'сервіс з валідацією' do |contract_class|
  context 'з невалідними параметрами' do
    let(:invalid_params) { {} }

    it 'використовує правильний контракт' do
      expect(contract_class).to receive(:new).and_call_original
      described_class.call(params: invalid_params)
    end
  end
end
```

---

## Інтеграція з API

```ruby
# app/api/v1/recipes.rb
module Api
  module V1
    class Recipes < Grape::API
      helpers do
        def handle_result(result)
          if result.success?
            result.value!
          else
            error = result.failure
            status_code = case error[:code]
                          when :validation_error then 422
                          when :not_found then 404
                          when :unauthorized then 401
                          else 400
                          end
            error!({ error: error }, status_code)
          end
        end
      end

      resource :recipes do
        post do
          authenticate!

          result = ::Recipes::Create.call(
            params: declared(params),
            user: current_user
          )

          recipe = handle_result(result)
          present recipe, with: Entities::Recipe
        end
      end
    end
  end
end
```

---

## Конфігурація i18n

```yaml
# config/locales/contracts/en.yml
en:
  contracts:
    errors:
      invalid_email: "is not a valid email address"
      weak_password: "must be at least 8 characters"
      passwords_dont_match: "doesn't match password"
      already_taken: "has already been taken"
      not_found: "not found"
      ingredients_not_found: "not found: %{missing}"
      at_least_one_required: "requires at least one item"
      too_many_ingredients: "cannot exceed 50 items"
```

```yaml
# config/locales/contracts/uk.yml
uk:
  contracts:
    errors:
      invalid_email: "недійсна адреса електронної пошти"
      weak_password: "має містити щонайменше 8 символів"
      passwords_dont_match: "не співпадає з паролем"
      already_taken: "вже зайнято"
      not_found: "не знайдено"
      ingredients_not_found: "не знайдено: %{missing}"
      at_least_one_required: "потрібен хоча б один елемент"
      too_many_ingredients: "не може перевищувати 50 елементів"
```

---

## Пов'язана документація

- [01-project-overview.md](01-project-overview.md) - Огляд проєкту
- [02-tech-stack.md](02-tech-stack.md) - Технологічний стек
- [04-api-specification.md](04-api-specification.md) - Документація API
