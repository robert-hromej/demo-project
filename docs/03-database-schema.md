# Схема бази даних

## Огляд

RecipeMatch використовує PostgreSQL з 6 основними таблицями для управління рецептами, інгредієнтами, категоріями, користувачами та оцінками.

## Діаграма зв'язків сутностей (ERD)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│     users       │
├─────────────────┤
│ id              │─────────────────────────────────────┐
│ email           │                                     │
│ password_digest │                                     │
│ name            │                                     │
│ avatar_url      │                                     │
│ created_at      │                                     │
│ updated_at      │                                     │
└─────────────────┘                                     │
                                                        │
┌─────────────────┐         ┌─────────────────┐        │
│   categories    │         │     recipes     │        │
├─────────────────┤         ├─────────────────┤        │
│ id              │◄────────│ category_id     │        │
│ name            │   ┌─────│ id              │◄───────┼────────┐
│ description     │   │     │ title           │        │        │
│ image_url       │   │     │ description     │        │        │
│ ancestry        │   │     │ instructions    │        │        │
│ position        │   │     │ prep_time_min   │        │        │
│ created_at      │   │     │ cook_time_min   │        │        │
│ updated_at      │   │     │ servings        │        │        │
└─────────────────┘   │     │ difficulty      │        │        │
      ▲               │     │ image_url       │        │        │
      │ (self-ref)    │     │ est_cost_cents  │        │        │
      │ ancestry      │     │ avg_rating      │        │        │
      └───────────────┘     │ ratings_count   │        │        │
                            │ created_at      │        │        │
                            │ updated_at      │        │        │
                            └─────────────────┘        │        │
                                    │                  │        │
                                    │                  │        │
                    ┌───────────────┴───────────────┐  │        │
                    │                               │  │        │
                    ▼                               ▼  │        │
    ┌───────────────────────┐       ┌─────────────────┴─────┐  │
    │  recipe_ingredients   │       │       ratings         │  │
    ├───────────────────────┤       ├───────────────────────┤  │
    │ id                    │       │ id                    │  │
    │ recipe_id             │───────│ recipe_id             │──┘
    │ ingredient_id         │◄──┐   │ user_id               │
    │ quantity              │   │   │ score                 │
    │ unit                  │   │   │ review                │
    │ notes                 │   │   │ created_at            │
    │ optional              │   │   │ updated_at            │
    │ created_at            │   │   └───────────────────────┘
    │ updated_at            │   │
    └───────────────────────┘   │
                                │
    ┌─────────────────┐         │
    │   ingredients   │         │
    ├─────────────────┤         │
    │ id              │─────────┘
    │ name            │
    │ name_uk         │
    │ unit_price_cents│
    │ default_unit    │
    │ category        │
    │ image_url       │
    │ created_at      │
    │ updated_at      │
    └─────────────────┘
```

## Зв'язки між таблицями

```
users
  ├── has_many :ratings
  └── has_many :rated_recipes, through: :ratings, source: :recipe

categories
  ├── has_many :recipes
  └── has_many :children (self-referential via ancestry)

recipes
  ├── belongs_to :category
  ├── has_many :recipe_ingredients, dependent: :destroy
  ├── has_many :ingredients, through: :recipe_ingredients
  └── has_many :ratings, dependent: :destroy

ingredients
  └── has_many :recipe_ingredients

recipe_ingredients
  ├── belongs_to :recipe
  └── belongs_to :ingredient

ratings
  ├── belongs_to :user
  └── belongs_to :recipe
```

---

## Визначення таблиць

### 1. users

Зберігає інформацію про облікові записи користувачів.

| Колонка | Тип | Обмеження | Опис |
|---------|-----|-----------|------|
| `id` | bigint | PK, auto | Первинний ключ |
| `email` | string(255) | unique, not null | Email користувача |
| `password_digest` | string(255) | not null | bcrypt хеш |
| `name` | string(100) | not null | Ім'я для відображення |
| `avatar_url` | string(500) | nullable | Аватар профілю |
| `created_at` | timestamp | not null | Час створення |
| `updated_at` | timestamp | not null | Час оновлення |

**Індекси:**
- `index_users_on_email` (unique)

```ruby
# Міграція
create_table :users do |t|
  t.string :email, null: false, limit: 255
  t.string :password_digest, null: false, limit: 255
  t.string :name, null: false, limit: 100
  t.string :avatar_url, limit: 500
  t.timestamps
end

add_index :users, :email, unique: true
```

---

### 2. categories

Ієрархічні категорії рецептів з використанням гему ancestry.

| Колонка | Тип | Обмеження | Опис |
|---------|-----|-----------|------|
| `id` | bigint | PK, auto | Первинний ключ |
| `name` | string(100) | not null | Назва категорії (українською) |
| `description` | text | nullable | Опис категорії |
| `image_url` | string(500) | nullable | Зображення категорії |
| `ancestry` | string | nullable | Ієрархічний шлях |
| `position` | integer | default: 0 | Порядок сортування |
| `created_at` | timestamp | not null | Час створення |
| `updated_at` | timestamp | not null | Час оновлення |

**Індекси:**
- `index_categories_on_ancestry`
- `index_categories_on_position`

**Приклад ієрархії:**
```
Основні страви (id: 1, ancestry: null)
├── Супи (id: 2, ancestry: "1")
│   ├── Борщі (id: 3, ancestry: "1/2")
│   └── Бульйони (id: 4, ancestry: "1/2")
├── Другі страви (id: 5, ancestry: "1")
└── Салати (id: 6, ancestry: "1")
```

```ruby
# Міграція
create_table :categories do |t|
  t.string :name, null: false, limit: 100
  t.text :description
  t.string :image_url, limit: 500
  t.string :ancestry
  t.integer :position, default: 0
  t.timestamps
end

add_index :categories, :ancestry
add_index :categories, :position
```

---

### 3. recipes

Основна таблиця рецептів.

| Колонка | Тип | Обмеження | Опис |
|---------|-----|-----------|------|
| `id` | bigint | PK, auto | Первинний ключ |
| `category_id` | bigint | FK, nullable | Посилання на категорію |
| `title` | string(255) | not null | Назва рецепту |
| `description` | text | nullable | Короткий опис |
| `instructions` | text | not null | Покрокова інструкція |
| `prep_time_min` | integer | not null | Час підготовки (хвилини) |
| `cook_time_min` | integer | not null | Час приготування (хвилини) |
| `servings` | integer | not null, default: 4 | Кількість порцій |
| `difficulty` | integer | not null, default: 0 | Enum: easy/medium/hard |
| `image_url` | string(500) | nullable | Зображення рецепту |
| `est_cost_cents` | integer | default: 0 | Орієнтовна вартість у копійках |
| `avg_rating` | decimal(3,2) | default: 0 | Кешована середня оцінка |
| `ratings_count` | integer | default: 0 | Кешована кількість оцінок |
| `created_at` | timestamp | not null | Час створення |
| `updated_at` | timestamp | not null | Час оновлення |

**Індекси:**
- `index_recipes_on_category_id`
- `index_recipes_on_avg_rating`
- `index_recipes_on_est_cost_cents`
- `index_recipes_on_difficulty`

**Enum'и:**
```ruby
enum :difficulty, { easy: 0, medium: 1, hard: 2 }
```

```ruby
# Міграція
create_table :recipes do |t|
  t.references :category, foreign_key: true
  t.string :title, null: false, limit: 255
  t.text :description
  t.text :instructions, null: false
  t.integer :prep_time_min, null: false
  t.integer :cook_time_min, null: false
  t.integer :servings, null: false, default: 4
  t.integer :difficulty, null: false, default: 0
  t.string :image_url, limit: 500
  t.integer :est_cost_cents, default: 0
  t.decimal :avg_rating, precision: 3, scale: 2, default: 0
  t.integer :ratings_count, default: 0
  t.timestamps
end

add_index :recipes, :avg_rating
add_index :recipes, :est_cost_cents
add_index :recipes, :difficulty
```

---

### 4. ingredients

Головний список інгредієнтів з цінами.

| Колонка | Тип | Обмеження | Опис |
|---------|-----|-----------|------|
| `id` | bigint | PK, auto | Первинний ключ |
| `name` | string(100) | not null, unique | Назва інгредієнта (англійською) |
| `name_uk` | string(100) | not null | Українська назва |
| `unit_price_cents` | integer | default: 0 | Ціна за одиницю виміру (копійки) |
| `default_unit` | string(20) | default: 'pcs' | Одиниця виміру за замовчуванням (g, ml, pcs тощо) |
| `category` | string(50) | nullable | Категорія інгредієнта |
| `image_url` | string(500) | nullable | Зображення інгредієнта |
| `created_at` | timestamp | not null | Час створення |
| `updated_at` | timestamp | not null | Час оновлення |

**Індекси:**
- `index_ingredients_on_name` (unique)
- `index_ingredients_on_name_uk`
- `index_ingredients_on_category`

**Типи одиниць виміру:**
- `g` - грами
- `kg` - кілограми
- `ml` - мілілітри
- `l` - літри
- `pcs` - штуки
- `tbsp` - столова ложка
- `tsp` - чайна ложка
- `cup` - чашка

```ruby
# Міграція
create_table :ingredients do |t|
  t.string :name, null: false, limit: 100
  t.string :name_uk, null: false, limit: 100
  t.integer :unit_price_cents, default: 0
  t.string :default_unit, limit: 20, default: 'pcs'
  t.string :category, limit: 50
  t.string :image_url, limit: 500
  t.timestamps
end

add_index :ingredients, :name, unique: true
add_index :ingredients, :name_uk
add_index :ingredients, :category
```

---

### 5. recipe_ingredients

Зв'язувальна таблиця, що поєднує рецепти з інгредієнтами та їх кількостями.

| Колонка | Тип | Обмеження | Опис |
|---------|-----|-----------|------|
| `id` | bigint | PK, auto | Первинний ключ |
| `recipe_id` | bigint | FK, not null | Посилання на рецепт |
| `ingredient_id` | bigint | FK, not null | Посилання на інгредієнт |
| `quantity` | decimal(10,3) | not null | Необхідна кількість |
| `unit` | string(20) | not null | Одиниця виміру (g, ml, pcs тощо) |
| `notes` | string(255) | nullable | Додаткові примітки |
| `optional` | boolean | default: false | Чи є інгредієнт опціональним? |
| `created_at` | timestamp | not null | Час створення |
| `updated_at` | timestamp | not null | Час оновлення |

**Індекси:**
- `index_recipe_ingredients_on_recipe_id`
- `index_recipe_ingredients_on_ingredient_id`
- `index_recipe_ingredients_on_recipe_id_and_ingredient_id` (unique)

```ruby
# Міграція
create_table :recipe_ingredients do |t|
  t.references :recipe, null: false, foreign_key: true
  t.references :ingredient, null: false, foreign_key: true
  t.decimal :quantity, precision: 10, scale: 3, null: false
  t.string :unit, null: false, limit: 20
  t.string :notes, limit: 255
  t.boolean :optional, default: false
  t.timestamps
end

add_index :recipe_ingredients, [:recipe_id, :ingredient_id], unique: true
```

---

### 6. ratings

Оцінки та відгуки користувачів про рецепти.

| Колонка | Тип | Обмеження | Опис |
|---------|-----|-----------|------|
| `id` | bigint | PK, auto | Первинний ключ |
| `recipe_id` | bigint | FK, not null | Посилання на рецепт |
| `user_id` | bigint | FK, not null | Посилання на користувача |
| `score` | integer | not null | Оцінка 1-5 |
| `review` | text | nullable | Текстовий відгук |
| `created_at` | timestamp | not null | Час створення |
| `updated_at` | timestamp | not null | Час оновлення |

**Індекси:**
- `index_ratings_on_recipe_id`
- `index_ratings_on_user_id`
- `index_ratings_on_recipe_id_and_user_id` (unique)
- `index_ratings_on_score`

**Обмеження:**
- `score` має бути від 1 до 5
- Користувач може оцінити рецепт лише один раз (унікальне обмеження)

```ruby
# Міграція
create_table :ratings do |t|
  t.references :recipe, null: false, foreign_key: true
  t.references :user, null: false, foreign_key: true
  t.integer :score, null: false
  t.text :review
  t.timestamps
end

add_index :ratings, [:recipe_id, :user_id], unique: true
add_index :ratings, :score
```

---

## Приклади запитів

### Пошук рецептів за наявними інгредієнтами

```sql
-- Знайти рецепти, де користувач має щонайменше 80% необхідних інгредієнтів
WITH user_ingredients AS (
  SELECT id FROM ingredients WHERE id IN (1, 2, 3, 4, 5)  -- Наявні інгредієнти користувача
),
recipe_match AS (
  SELECT
    r.id,
    r.title,
    COUNT(ri.ingredient_id) AS total_ingredients,
    COUNT(ui.id) AS matched_ingredients,
    ROUND(COUNT(ui.id)::numeric / COUNT(ri.ingredient_id) * 100, 2) AS match_percentage
  FROM recipes r
  JOIN recipe_ingredients ri ON ri.recipe_id = r.id
  LEFT JOIN user_ingredients ui ON ui.id = ri.ingredient_id
  WHERE ri.optional = false  -- Виключити опціональні інгредієнти
  GROUP BY r.id, r.title
)
SELECT * FROM recipe_match
WHERE match_percentage >= 80
ORDER BY match_percentage DESC, total_ingredients ASC;
```

### Пошук рецептів у межах бюджету

```sql
-- Знайти рецепти з орієнтовною вартістю <= 200 грн (20000 копійок)
SELECT
  id,
  title,
  est_cost_cents / 100.0 AS cost_uah,
  servings,
  (est_cost_cents / servings) / 100.0 AS cost_per_serving_uah
FROM recipes
WHERE est_cost_cents <= 20000
ORDER BY cost_per_serving_uah ASC;
```

### Отримати найкращі рецепти за рейтингом

```sql
SELECT
  r.id,
  r.title,
  r.avg_rating,
  r.ratings_count,
  c.name AS category
FROM recipes r
LEFT JOIN categories c ON c.id = r.category_id
WHERE r.ratings_count >= 5  -- Мінімальна кількість оцінок
ORDER BY r.avg_rating DESC, r.ratings_count DESC
LIMIT 10;
```

---

## Приклади заповнення даних

```ruby
# db/seeds.rb

# Категорії
snidanky = Category.create!(name: 'Сніданки', description: 'Страви для сніданку')
kashi = Category.create!(name: 'Каші', parent: snidanky)
yaechni = Category.create!(name: 'Страви з яєць', parent: snidanky)

# Інгредієнти
moloko = Ingredient.create!(
  name: 'milk',
  name_uk: 'Молоко',
  unit_price_cents: 4500,  # 45 грн за літр
  default_unit: 'ml',
  category: 'dairy'
)

yaytsya = Ingredient.create!(
  name: 'eggs',
  name_uk: 'Яйця',
  unit_price_cents: 500,   # 5 грн за штуку
  default_unit: 'pcs',
  category: 'dairy'
)

# Рецепт
omlette = Recipe.create!(
  title: 'Омлет з молоком',
  description: 'Класичний французький омлет',
  instructions: "1. Збийте яйця з молоком\n2. Посоліть\n3. Смажте на середньому вогні",
  prep_time_min: 5,
  cook_time_min: 10,
  servings: 2,
  difficulty: :easy,
  category: yaechni,
  est_cost_cents: 2500  # ~25 грн
)

# Інгредієнти рецепту
RecipeIngredient.create!(
  recipe: omlette,
  ingredient: yaytsya,
  quantity: 3,
  unit: 'pcs'
)

RecipeIngredient.create!(
  recipe: omlette,
  ingredient: moloko,
  quantity: 100,
  unit: 'ml'
)
```

---

## Пов'язана документація

- [01-project-overview.md](01-project-overview.md) - Огляд проекту
- [02-tech-stack.md](02-tech-stack.md) - Технологічний стек
- [04-api-specification.md](04-api-specification.md) - Документація API
