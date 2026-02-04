# Технологічний стек

## Огляд

RecipeMatch використовує сучасний Ruby on Rails API backend з React frontend, дотримуючись найкращих практик індустрії для масштабованих веб-застосунків.

```
┌─────────────────────────────────────────────────────┐
│               Архітектура RecipeMatch               │
├─────────────────────────────────────────────────────┤
│                                                      │
│   Frontend (React 19 + Vite + TypeScript)           │
│   └── app/frontend/                                 │
│                                                      │
├─────────────────────────────────────────────────────┤
│   Grape API                                          │
│   ├── app/api/v1/        (endpoints)                │
│   └── app/api/entities/  (serializers)              │
│                                                      │
├─────────────────────────────────────────────────────┤
│   Rails Backend                                      │
│   ├── Services (dry-monads)                         │
│   ├── Contracts (dry-validation)                    │
│   └── Models (ActiveRecord)                         │
├─────────────────────────────────────────────────────┤
│                   PostgreSQL                         │
└─────────────────────────────────────────────────────┘
```

---

## Backend стек

### Основний фреймворк

| Технологія | Версія | Призначення |
|------------|--------|-------------|
| Ruby | 3.4.x | Мова програмування |
| Rails | 8.1.2 | Веб-фреймворк |
| PostgreSQL | 16.x | Основна база даних |
| Puma | 6.x | Сервер застосунку |

### API рівень

| Gem | Призначення |
|-----|-------------|
| `grape` | DSL для REST API |
| `grape-entity` | Серіалізація відповідей |
| `grape-swagger` | Документація OpenAPI |
| `grape-swagger-entity` | Підтримка Swagger entity |

### Бізнес-логіка (dry-rb)

| Gem | Призначення |
|-----|-------------|
| `dry-monads` | Railway-oriented programming |
| `dry-validation` | Контракти валідації вводу |

### Утиліти

| Gem | Призначення |
|-----|-------------|
| `vite_rails` | Інтеграція frontend bundler |
| `pagy` | Пагінація |
| `money-rails` | Робота з валютою/грошима (UAH) |
| `jwt` | Автентифікація JSON Web Token |
| `bcrypt` | Хешування паролів |
| `ancestry` | Ієрархічні категорії |

### Фонова обробка

| Gem | Призначення |
|-----|-------------|
| `solid_queue` | Черга завдань (за замовчуванням у Rails 8) |
| `solid_cache` | Backend кешування |
| `solid_cable` | Backend WebSocket |

### Розробка та тестування

| Gem | Призначення |
|-----|-------------|
| `rspec-rails` | Фреймворк тестування |
| `factory_bot_rails` | Фабрики тестових даних |
| `faker` | Генерація фейкових даних |
| `shoulda-matchers` | RSpec matchers |
| `simplecov` | Покриття коду |
| `database_cleaner-active_record` | Очищення тестової бази даних |
| `webmock` | Мокування HTTP запитів |

### Якість коду

| Gem | Призначення |
|-----|-------------|
| `rubocop` | Ruby лінтер |
| `rubocop-rails` | Rails-специфічні cops |
| `rubocop-rspec` | RSpec-специфічні cops |
| `rubocop-performance` | Performance cops |
| `brakeman` | Сканер безпеки |
| `bundler-audit` | Сканер вразливостей залежностей |
| `bullet` | Виявлення N+1 запитів |

---

## Frontend стек

### Основні технології

| Технологія | Версія | Призначення |
|------------|--------|-------------|
| React | 19.x | UI бібліотека |
| TypeScript | 5.x | Type-safe JavaScript |
| Vite | 6.x | Інструмент збірки та dev server |

### Стилізація

| Технологія | Призначення |
|------------|-------------|
| Tailwind CSS | Utility-first CSS |
| PostCSS | Обробка CSS |

### Управління станом

| Бібліотека | Призначення |
|------------|-------------|
| Zustand | Глобальне управління станом |
| React Query | Стан сервера та кешування |

### Маршрутизація

| Бібліотека | Призначення |
|------------|-------------|
| React Router | Клієнтська маршрутизація |

### Обробка форм

| Бібліотека | Призначення |
|------------|-------------|
| React Hook Form | Управління станом форм |
| Zod | Валідація схем |

### Тестування (Frontend)

| Інструмент | Призначення |
|------------|-------------|
| Vitest | Test runner |
| React Testing Library | Тестування компонентів |
| MSW | Мокування API |

### Якість коду (Frontend)

| Інструмент | Призначення |
|------------|-------------|
| ESLint | JavaScript/TypeScript лінтер |
| Prettier | Форматування коду |

---

## Інфраструктура

### Розробка

```
┌─────────────────────────────────────────────────┐
│               Локальна розробка                  │
├─────────────────────────────────────────────────┤
│  bin/dev          - Запуск всіх сервісів        │
│  bin/rails s      - Тільки Rails сервер         │
│  npm run dev      - Vite dev server             │
└─────────────────────────────────────────────────┘
```

### Деплой

| Технологія | Призначення |
|------------|-------------|
| Docker | Контейнеризація |
| Kamal | Оркестрація деплою |
| Thruster | HTTP стиснення ресурсів |

### CI/CD

| Інструмент | Призначення |
|------------|-------------|
| GitHub Actions | CI/CD pipeline |
| Dependabot | Оновлення залежностей |

---

## Структура директорій

```
recipe-match/
├── app/
│   ├── api/                    # Grape API
│   │   ├── v1/                 # Endpoints версії 1
│   │   └── entities/           # Серіалізатори відповідей
│   ├── contracts/              # Контракти dry-validation
│   ├── controllers/            # Rails контролери (мінімально)
│   ├── frontend/               # React застосунок
│   │   ├── components/         # React компоненти
│   │   ├── pages/              # Компоненти сторінок
│   │   ├── api/                # API клієнт
│   │   ├── stores/             # Zustand stores
│   │   ├── hooks/              # Кастомні hooks
│   │   └── types/              # TypeScript типи
│   ├── models/                 # ActiveRecord моделі
│   ├── services/               # dry-monads сервіси
│   └── views/                  # Rails views (мінімально)
├── config/
├── db/
│   ├── migrate/                # Міграції бази даних
│   └── seeds.rb                # Seed дані
├── docs/                       # Документація проєкту
├── spec/                       # RSpec тести
│   ├── factories/              # Фабрики FactoryBot
│   ├── models/                 # Специфікації моделей
│   ├── contracts/              # Специфікації контрактів
│   ├── services/               # Специфікації сервісів
│   └── requests/               # Специфікації API запитів
└── public/
```

---

## Конфігураційні файли

### Backend

| Файл | Призначення |
|------|-------------|
| `Gemfile` | Ruby залежності |
| `.ruby-version` | Версія Ruby (rvm) |
| `.rubocop.yml` | Конфігурація RuboCop |
| `config/database.yml` | Конфігурація бази даних |

### Frontend

| Файл | Призначення |
|------|-------------|
| `package.json` | Node залежності |
| `vite.config.ts` | Конфігурація Vite |
| `tsconfig.json` | Конфігурація TypeScript |
| `tailwind.config.js` | Конфігурація Tailwind |
| `.eslintrc.js` | Конфігурація ESLint |
| `.prettierrc` | Конфігурація Prettier |

---

## Вимоги до версій

```ruby
# Gemfile
ruby "~> 3.4.0"

gem "rails", "~> 8.1.2"
gem "pg", "~> 1.1"
```

```json
// package.json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

---

## Пов'язана документація

- [01-project-overview.md](01-project-overview.md) - Огляд проєкту
- [03-database-schema.md](03-database-schema.md) - Структура бази даних
- [06-dry-rb-patterns.md](06-dry-rb-patterns.md) - Патерни dry-monads
- [07-frontend-patterns.md](07-frontend-patterns.md) - Патерни React
