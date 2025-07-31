# Evrika Platform - Clean Version

Чистая версия платформы Evrika с минималистичной архитектурой.

## Структура проекта

```
evrika-clean/
├── backend/          # Express API сервер
│   ├── src/
│   │   ├── models/   # Модели данных
│   │   ├── routes/   # API маршруты
│   │   ├── services/ # Бизнес-логика
│   │   └── utils/    # Утилиты
│   ├── database/     # SQLite база данных
│   └── package.json
├── frontend/         # SvelteKit приложение
│   ├── src/
│   │   ├── lib/      # Компоненты и утилиты
│   │   ├── routes/   # Страницы
│   │   └── app.html
│   └── package.json
└── README.md
```

## Технологии

**Backend:**
- Node.js + Express
- SQLite (без ORM)
- JWT для аутентификации

**Frontend:**
- SvelteKit
- TailwindCSS
- TypeScript

## Цели

1. ✨ Чистый, читаемый код
2. 🏗️ Простая архитектура
3. 🚀 Быстрая разработка
4. 📦 Минимум зависимостей
