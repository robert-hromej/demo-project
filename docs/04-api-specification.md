# Специфікація API

## Огляд

RecipeMatch використовує RESTful API, побудований на Grape. Усі ендпоінти версіоновані під `/api/v1/`.

## Базова URL-адреса

```
Development: http://localhost:3000/api/v1
Production:  https://recipematch.example.com/api/v1
```

## Автентифікація

Автентифікація на основі JWT. Включайте токен у заголовок Authorization:

```
Authorization: Bearer <token>
```

### Публічні ендпоінти (без автентифікації)
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/recipes` (тільки читання)
- `GET /api/v1/recipes/:id` (тільки читання)
- `GET /api/v1/categories` (тільки читання)
- `GET /api/v1/ingredients` (тільки читання)

### Захищені ендпоінти (потрібна автентифікація)
- Усі операції запису (POST, PUT, DELETE)
- Операції з профілем користувача
- Створення/оновлення оцінок

---

## Формат відповіді

### Успішна відповідь

```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

### Відповідь з помилкою

```json
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed",
    "details": {
      "title": ["is required"],
      "prep_time_min": ["must be greater than 0"]
    }
  }
}
```

### HTTP-коди статусу

| Код | Опис |
|-----|------|
| 200 | OK |
| 201 | Створено |
| 204 | Без контенту (успішне видалення) |
| 400 | Неправильний запит |
| 401 | Не авторизовано |
| 403 | Заборонено |
| 404 | Не знайдено |
| 422 | Неможливо обробити сутність (валідація) |
| 500 | Внутрішня помилка сервера |

---

## Ендпоінти API

### Автентифікація

#### POST /api/v1/auth/register

Реєстрація нового користувача.

**Запит:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "name": "Іван Петренко"
}
```

**Відповідь (201):**
```json
{
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "Іван Петренко",
      "avatar_url": null,
      "created_at": "2024-01-15T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /api/v1/auth/login

Автентифікація користувача.

**Запит:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Відповідь (200):**
```json
{
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "Іван Петренко"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### GET /api/v1/auth/me

Отримати профіль поточного користувача.

**Заголовки:** `Authorization: Bearer <token>`

**Відповідь (200):**
```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "Іван Петренко",
    "avatar_url": null,
    "ratings_count": 15,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### Категорії

#### GET /api/v1/categories

Список усіх категорій (деревоподібна структура).

**Параметри запиту:**
| Параметр | Тип | Опис |
|----------|-----|------|
| `flat` | boolean | Повернути плоский список замість дерева |

**Відповідь (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Сніданки",
      "description": "Страви для сніданку",
      "image_url": null,
      "recipes_count": 25,
      "children": [
        {
          "id": 2,
          "name": "Каші",
          "description": null,
          "recipes_count": 10,
          "children": []
        },
        {
          "id": 3,
          "name": "Страви з яєць",
          "description": null,
          "recipes_count": 15,
          "children": []
        }
      ]
    }
  ]
}
```

#### GET /api/v1/categories/:id

Отримати окрему категорію з рецептами.

**Відповідь (200):**
```json
{
  "data": {
    "id": 1,
    "name": "Сніданки",
    "description": "Страви для сніданку",
    "image_url": null,
    "parent": null,
    "children": [
      { "id": 2, "name": "Каші" },
      { "id": 3, "name": "Страви з яєць" }
    ],
    "recipes": [
      {
        "id": 1,
        "title": "Омлет з молоком",
        "prep_time_min": 5,
        "avg_rating": 4.5
      }
    ]
  }
}
```

#### POST /api/v1/categories

Створити категорію (тільки для адміністратора).

**Запит:**
```json
{
  "name": "Десерти",
  "description": "Солодкі страви",
  "parent_id": null
}
```

#### PUT /api/v1/categories/:id

Оновити категорію (тільки для адміністратора).

#### DELETE /api/v1/categories/:id

Видалити категорію (тільки для адміністратора).

---

### Інгредієнти

#### GET /api/v1/ingredients

Список усіх інгредієнтів з пошуком.

**Параметри запиту:**
| Параметр | Тип | Опис |
|----------|-----|------|
| `search` | string | Пошук за назвою (українською або англійською) |
| `category` | string | Фільтр за категорією (dairy, vegetables тощо) |
| `page` | integer | Номер сторінки |
| `per_page` | integer | Елементів на сторінку (макс. 100) |

**Відповідь (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "milk",
      "name_uk": "Молоко",
      "unit_price_cents": 4500,
      "unit_price_formatted": "45.00 UAH",
      "default_unit": "ml",
      "category": "dairy",
      "image_url": null
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150
  }
}
```

#### GET /api/v1/ingredients/:id

Отримати окремий інгредієнт.

#### POST /api/v1/ingredients

Створити інгредієнт (тільки для адміністратора).

**Запит:**
```json
{
  "name": "butter",
  "name_uk": "Масло вершкове",
  "unit_price_cents": 8500,
  "default_unit": "g",
  "category": "dairy"
}
```

#### PUT /api/v1/ingredients/:id

Оновити інгредієнт (тільки для адміністратора).

#### DELETE /api/v1/ingredients/:id

Видалити інгредієнт (тільки для адміністратора).

---

### Рецепти

#### GET /api/v1/recipes

Список рецептів з фільтрацією та пошуком.

**Параметри запиту:**
| Параметр | Тип | Опис |
|----------|-----|------|
| `search` | string | Пошук у назві/описі |
| `category_id` | integer | Фільтр за категорією |
| `difficulty` | string | Фільтр за складністю (easy, medium, hard) |
| `max_cost` | integer | Максимальна вартість у копійках |
| `max_prep_time` | integer | Максимальний час підготовки у хвилинах |
| `max_cook_time` | integer | Максимальний час приготування у хвилинах |
| `min_rating` | decimal | Мінімальна середня оцінка |
| `ingredients` | array | Фільтр за наявними інгредієнтами (ID) |
| `match_percentage` | integer | Мінімальний відсоток збігу інгредієнтів (за замовчуванням: 80) |
| `sort` | string | Поле сортування (rating, cost, time, created_at) |
| `order` | string | Порядок сортування (asc, desc) |
| `page` | integer | Номер сторінки |
| `per_page` | integer | Елементів на сторінку |

**Відповідь (200):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Омлет з молоком",
      "description": "Класичний французький омлет",
      "category": {
        "id": 3,
        "name": "Страви з яєць"
      },
      "prep_time_min": 5,
      "cook_time_min": 10,
      "total_time_min": 15,
      "servings": 2,
      "difficulty": "easy",
      "image_url": null,
      "est_cost_cents": 2500,
      "est_cost_formatted": "25.00 UAH",
      "cost_per_serving_formatted": "12.50 UAH",
      "avg_rating": 4.5,
      "ratings_count": 23,
      "ingredients_count": 5,
      "matched_ingredients_count": 4,
      "match_percentage": 80
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 45
  }
}
```

#### GET /api/v1/recipes/:id

Отримати окремий рецепт з повними деталями.

**Відповідь (200):**
```json
{
  "data": {
    "id": 1,
    "title": "Омлет з молоком",
    "description": "Класичний французький омлет",
    "instructions": "1. Збийте яйця з молоком\n2. Посоліть\n3. Смажте на середньому вогні",
    "category": {
      "id": 3,
      "name": "Страви з яєць"
    },
    "prep_time_min": 5,
    "cook_time_min": 10,
    "total_time_min": 15,
    "servings": 2,
    "difficulty": "easy",
    "image_url": null,
    "est_cost_cents": 2500,
    "est_cost_formatted": "25.00 UAH",
    "cost_per_serving_formatted": "12.50 UAH",
    "avg_rating": 4.5,
    "ratings_count": 23,
    "ingredients": [
      {
        "id": 1,
        "name": "eggs",
        "name_uk": "Яйця",
        "quantity": 3,
        "unit": "pcs",
        "notes": null,
        "optional": false,
        "estimated_cost_cents": 1500,
        "estimated_cost_formatted": "15.00 UAH"
      },
      {
        "id": 2,
        "name": "milk",
        "name_uk": "Молоко",
        "quantity": 100,
        "unit": "ml",
        "notes": "або вершки",
        "optional": false,
        "estimated_cost_cents": 450,
        "estimated_cost_formatted": "4.50 UAH"
      }
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

#### POST /api/v1/recipes

Створити рецепт.

**Запит:**
```json
{
  "title": "Вареники з картоплею",
  "description": "Традиційні українські вареники",
  "instructions": "1. Приготуйте тісто\n2. Зробіть начинку\n3. Зліпіть вареники\n4. Варіть 5 хвилин",
  "category_id": 5,
  "prep_time_min": 60,
  "cook_time_min": 15,
  "servings": 6,
  "difficulty": "medium",
  "ingredients": [
    {
      "ingredient_id": 10,
      "quantity": 500,
      "unit": "g",
      "notes": null,
      "optional": false
    },
    {
      "ingredient_id": 15,
      "quantity": 1,
      "unit": "kg",
      "notes": "очищеної",
      "optional": false
    }
  ]
}
```

**Відповідь (201):**
```json
{
  "data": {
    "id": 2,
    "title": "Вареники з картоплею",
    "est_cost_cents": 15000
  }
}
```

#### PUT /api/v1/recipes/:id

Оновити рецепт.

#### DELETE /api/v1/recipes/:id

Видалити рецепт.

---

### Оцінки

#### GET /api/v1/recipes/:recipe_id/ratings

Отримати оцінки рецепту.

**Відповідь (200):**
```json
{
  "data": [
    {
      "id": 1,
      "score": 5,
      "review": "Дуже смачний рецепт! Готую щотижня.",
      "user": {
        "id": 1,
        "name": "Іван Петренко",
        "avatar_url": null
      },
      "created_at": "2024-01-20T14:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 23,
    "average_score": 4.5
  }
}
```

#### POST /api/v1/recipes/:recipe_id/ratings

Створити або оновити оцінку (одна на користувача).

**Запит:**
```json
{
  "score": 5,
  "review": "Дуже смачний рецепт!"
}
```

#### DELETE /api/v1/recipes/:recipe_id/ratings

Видалити оцінку користувача.

---

### Ендпоінти пошуку

#### POST /api/v1/search/by-ingredients

Пошук рецептів за наявними інгредієнтами.

**Запит:**
```json
{
  "ingredient_ids": [1, 2, 5, 10, 15],
  "match_percentage": 70,
  "include_optional": false,
  "sort": "match_percentage",
  "order": "desc"
}
```

**Відповідь (200):**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Омлет з молоком",
      "total_ingredients": 5,
      "matched_ingredients": 4,
      "missing_ingredients": [
        {
          "id": 8,
          "name_uk": "Петрушка",
          "optional": true
        }
      ],
      "match_percentage": 80,
      "est_cost_cents": 2500
    }
  ]
}
```

#### POST /api/v1/search/by-budget

Пошук рецептів за бюджетом.

**Запит:**
```json
{
  "budget_cents": 20000,
  "servings": 4,
  "category_id": null,
  "sort": "cost_per_serving",
  "order": "asc"
}
```

**Відповідь (200):**
```json
{
  "data": [
    {
      "id": 5,
      "title": "Каша вівсяна з фруктами",
      "servings": 2,
      "est_cost_cents": 5000,
      "cost_per_serving_cents": 2500,
      "cost_per_serving_formatted": "25.00 UAH",
      "fits_budget": true,
      "remaining_budget_cents": 15000
    }
  ]
}
```

---

## Структура Grape API

```
app/api/
├── root.rb                     # Головна точка монтування API
├── base_endpoint.rb            # Базовий клас з хелперами
├── v1/
│   ├── root.rb                 # Корінь API V1
│   ├── auth.rb                 # Ендпоінти автентифікації
│   ├── categories.rb           # CRUD категорій
│   ├── ingredients.rb          # CRUD інгредієнтів
│   ├── recipes.rb              # CRUD рецептів
│   ├── ratings.rb              # Оцінки (вкладені під рецепти)
│   └── search.rb               # Ендпоінти пошуку
└── entities/
    ├── user_entity.rb
    ├── category_entity.rb
    ├── ingredient_entity.rb
    ├── recipe_entity.rb
    ├── recipe_ingredient_entity.rb
    └── rating_entity.rb
```

### Приклад реалізації ендпоінта

```ruby
# app/api/v1/recipes.rb
module Api
  module V1
    class Recipes < Grape::API
      resource :recipes do
        desc 'Список рецептів з фільтрацією'
        params do
          optional :search, type: String, desc: 'Пошуковий запит'
          optional :category_id, type: Integer
          optional :difficulty, type: String, values: %w[easy medium hard]
          optional :max_cost, type: Integer, desc: 'Максимальна вартість у копійках'
          optional :ingredients, type: Array[Integer], desc: 'ID наявних інгредієнтів'
          optional :match_percentage, type: Integer, default: 80
          optional :page, type: Integer, default: 1
          optional :per_page, type: Integer, default: 20, values: 1..100
        end
        get do
          result = ::Recipes::Search.call(params: declared(params))

          if result.success?
            present result.value![:recipes], with: Entities::Recipe
          else
            error!(result.failure, 422)
          end
        end

        desc 'Отримати рецепт за ID'
        params do
          requires :id, type: Integer
        end
        get ':id' do
          recipe = Recipe.includes(:category, :ingredients).find(params[:id])
          present recipe, with: Entities::Recipe, full: true
        end

        desc 'Створити рецепт'
        params do
          requires :title, type: String
          requires :instructions, type: String
          requires :prep_time_min, type: Integer
          requires :cook_time_min, type: Integer
          optional :description, type: String
          optional :category_id, type: Integer
          optional :servings, type: Integer, default: 4
          optional :difficulty, type: String, default: 'easy'
          optional :ingredients, type: Array do
            requires :ingredient_id, type: Integer
            requires :quantity, type: BigDecimal
            requires :unit, type: String
            optional :notes, type: String
            optional :optional, type: Boolean, default: false
          end
        end
        post do
          authenticate!

          result = ::Recipes::Create.call(
            params: declared(params),
            user: current_user
          )

          if result.success?
            present result.value!, with: Entities::Recipe
          else
            error!(result.failure, 422)
          end
        end
      end
    end
  end
end
```

---

## OpenAPI / Swagger

Документація API генерується автоматично і доступна за адресами:

```
Development: http://localhost:3000/api/v1/swagger_doc
Swagger UI:  http://localhost:3000/api/documentation
```

---

## Пов'язана документація

- [01-project-overview.md](01-project-overview.md) - Огляд проекту
- [03-database-schema.md](03-database-schema.md) - Структура бази даних
- [06-dry-rb-patterns.md](06-dry-rb-patterns.md) - Патерни сервісів
