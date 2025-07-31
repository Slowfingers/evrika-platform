# 🚀 Развертывание Evrika Platform на Render (бесплатно)

## 📋 Подготовка проекта (уже выполнено)

✅ Все необходимые файлы уже созданы:
- `render.yaml` - конфигурация для Render
- `backend/Dockerfile` - Docker образ для backend
- `frontend/Dockerfile` - Docker образ для frontend
- `.gitignore` - исключения для Git
- `.env.example` - шаблон переменных окружения

## 🔧 Шаг 1: Подготовка репозитория

### 1.1 Инициализация Git репозитория
```bash
cd /Volumes/Macintosh\ HD/Evrika/platform/evrika-app/evrika-clean
git init
git add .
git commit -m "Initial commit: Evrika Platform ready for Render"
```

### 1.2 Создание репозитория на GitHub
1. Зайдите на [GitHub.com](https://github.com)
2. Нажмите "New repository"
3. Название: `evrika-platform`
4. Описание: `Evrika Platform - Educational techniques catalog`
5. Выберите "Public" (для бесплатного плана)
6. НЕ добавляйте README, .gitignore или лицензию (уже есть)
7. Нажмите "Create repository"

### 1.3 Загрузка кода на GitHub
```bash
git remote add origin https://github.com/ВАШ_USERNAME/evrika-platform.git
git branch -M main
git push -u origin main
```

## 🌐 Шаг 2: Регистрация на Render

### 2.1 Создание аккаунта
1. Перейдите на [render.com](https://render.com)
2. Нажмите "Get Started for Free"
3. Зарегистрируйтесь через GitHub аккаунт
4. Подтвердите доступ к вашим репозиториям

## 🚀 Шаг 3: Развертывание на Render

### 3.1 Создание нового сервиса
1. В панели Render нажмите "New +"
2. Выберите "Blueprint"
3. Подключите ваш GitHub репозиторий `evrika-platform`
4. Render автоматически найдет файл `render.yaml`

### 3.2 Настройка переменных окружения
Render автоматически создаст переменные из `render.yaml`, но проверьте:

**Для Backend сервиса:**
- `NODE_ENV` = `production`
- `PORT` = `10000`
- `JWT_SECRET` = (автоматически сгенерируется)
- `FRONTEND_URL` = `https://evrika-frontend.onrender.com`

**Для Frontend сервиса:**
- `NODE_ENV` = `production`
- `VITE_API_BASE_URL` = `https://evrika-backend.onrender.com/api`

### 3.3 Запуск развертывания
1. Нажмите "Apply"
2. Render начнет создавать два сервиса:
   - `evrika-backend` (API сервер)
   - `evrika-frontend` (веб-приложение)

## ⏱️ Шаг 4: Ожидание развертывания

### 4.1 Процесс развертывания
- **Backend**: ~5-10 минут
  - Установка зависимостей
  - Инициализация SQLite базы данных
  - Запуск сервера на порту 10000

- **Frontend**: ~3-7 минут
  - Установка зависимостей
  - Сборка SvelteKit приложения
  - Запуск в режиме preview

### 4.2 Проверка статуса
1. Следите за логами в панели Render
2. Дождитесь статуса "Live" для обоих сервисов
3. Получите URL адреса:
   - Backend: `https://evrika-backend.onrender.com`
   - Frontend: `https://evrika-frontend.onrender.com`

## 🎯 Шаг 5: Проверка работоспособности

### 5.1 Тестирование Backend API
Откройте в браузере:
```
https://evrika-backend.onrender.com/api/metadata/ages
```
Должен вернуться JSON с возрастными группами.

### 5.2 Тестирование Frontend
1. Откройте `https://evrika-frontend.onrender.com`
2. Проверьте загрузку главной страницы
3. Попробуйте зарегистрироваться/войти
4. Проверьте каталог карточек

## 🔧 Шаг 6: Настройка домена (опционально)

### 6.1 Кастомный домен
1. В настройках сервиса на Render
2. Перейдите в "Settings" → "Custom Domains"
3. Добавьте ваш домен
4. Настройте DNS записи у вашего провайдера

## 🚨 Возможные проблемы и решения

### Проблема: "Build failed"
**Решение:**
1. Проверьте логи сборки
2. Убедитесь, что все зависимости указаны в `package.json`
3. Проверьте синтаксис в `render.yaml`

### Проблема: "Service unavailable"
**Решение:**
1. Проверьте переменные окружения
2. Убедитесь, что порты указаны правильно
3. Проверьте логи выполнения

### Проблема: CORS ошибки
**Решение:**
1. Проверьте `FRONTEND_URL` в backend переменных
2. Убедитесь, что `VITE_API_BASE_URL` указывает на правильный backend URL

## 💡 Советы по оптимизации

### Бесплатный план Render:
- ⏰ Сервисы "засыпают" после 15 минут неактивности
- 🔄 Первый запрос после сна может занять ~30 секунд
- 📊 750 часов в месяц бесплатно (достаточно для тестирования)

### Для продакшена:
- Рассмотрите платный план ($7/месяц за сервис)
- Настройте мониторинг и алерты
- Добавьте SSL сертификаты для кастомных доменов

## 🎉 Готово!

Ваша Evrika Platform теперь доступна в интернете:
- 🌐 **Frontend**: `https://evrika-frontend.onrender.com`
- 🔧 **API**: `https://evrika-backend.onrender.com`

Поделитесь ссылкой с пользователями и наслаждайтесь вашим приложением в облаке!
