# RecipeMatch

Розумний застосунок для пошуку рецептів за наявними інгредієнтами та бюджетом.

## Ключові можливості

- **Пошук за інгредієнтами**: "В мене є молоко, 2 яйця, пів хліба - покажи що можна приготувати"
- **Пошук за бюджетом**: "В мене 200 грн - що приготувати?"
- **Рейтинги та відгуки**: Оцінюйте рецепти та залишайте коментарі
- **Каталог рецептів**: Перегляд за категоріями, складністю, часом приготування

## Технології

### Backend
- Ruby 3.4.x
- Rails 8.1.2
- PostgreSQL 16+
- Grape API
- dry-monads & dry-validation

### Frontend
- React 19
- TypeScript 5
- Vite 5
- Tailwind CSS 4
- Zustand (state management)
- TanStack Query

### Тестування
- RSpec (backend) - 95%+ coverage
- Vitest (frontend) - 95%+ coverage

## Встановлення

### Вимоги
- Ruby 3.4.x (rvm)
- Node.js 20+
- PostgreSQL 16+

### Налаштування

```bash
# Клонування репозиторію
git clone https://github.com/robert-hromej/demo-project.git
cd demo-project

# Встановлення Ruby залежностей
bundle install

# Встановлення Node залежностей
npm install

# Створення та міграція бази даних
bin/rails db:create db:migrate

# Завантаження тестових даних (опціонально)
bin/rails db:seed
```

## Запуск

### Development

```bash
# Запуск всіх сервісів (Rails + Vite)
bin/dev

# Або окремо:
bin/rails server        # Rails на порту 3000
npm run dev            # Vite dev server
```

Відкрийте http://localhost:3000

### Тестування

```bash
# Backend тести
bundle exec rspec

# Frontend тести
npm test

# З покриттям
COVERAGE=true bundle exec rspec
npm run test:coverage

# Лінтинг
bundle exec rubocop
npm run lint
npm run typecheck
```

## Структура проекту

```
app/
├── api/              # Grape API endpoints
│   ├── v1/           # API версії 1
│   └── entities/     # Серіалізатори
├── contracts/        # dry-validation контракти
├── services/         # dry-monads сервіси
├── models/           # ActiveRecord моделі
├── frontend/         # React застосунок
│   ├── components/   # React компоненти
│   ├── pages/        # Сторінки
│   ├── api/          # API клієнт
│   ├── stores/       # Zustand сховища
│   └── hooks/        # Custom hooks
└── views/            # Rails views (мінімально)

docs/                 # Документація (українською)
spec/                 # RSpec тести
```

## API

API доступний на `/api/v1/`. Детальна документація: [docs/04-api-specification.md](docs/04-api-specification.md)

### Основні ендпоінти

| Метод | Шлях | Опис |
|-------|------|------|
| POST | /api/v1/auth/register | Реєстрація |
| POST | /api/v1/auth/login | Вхід |
| GET | /api/v1/recipes | Список рецептів |
| GET | /api/v1/recipes/:id | Деталі рецепту |
| POST | /api/v1/search/by-ingredients | Пошук за інгредієнтами |
| POST | /api/v1/search/by-budget | Пошук за бюджетом |
| GET | /api/v1/ingredients | Список інгредієнтів |
| GET | /api/v1/categories | Категорії рецептів |

## Документація

Детальна документація знаходиться в директорії `docs/`:

- [01-project-overview.md](docs/01-project-overview.md) - Огляд проекту
- [02-tech-stack.md](docs/02-tech-stack.md) - Технології
- [03-database-schema.md](docs/03-database-schema.md) - Схема БД
- [04-api-specification.md](docs/04-api-specification.md) - API специфікація
- [05-development-phases.md](docs/05-development-phases.md) - Фази розробки
- [06-dry-rb-patterns.md](docs/06-dry-rb-patterns.md) - Патерни dry-rb
- [07-frontend-patterns.md](docs/07-frontend-patterns.md) - Патерни React

## Ліцензія

MIT
