# ⚡ Быстрый старт - Развертывание на Render

## 🚀 Команды для копирования

### 1. Инициализация Git
```bash
cd "/Volumes/Macintosh HD/Evrika/platform/evrika-app/evrika-clean"
git init
git add .
git commit -m "Initial commit: Evrika Platform ready for Render"
```

### 2. Подключение к GitHub (замените YOUR_USERNAME)
```bash
git remote add origin https://github.com/YOUR_USERNAME/evrika-platform.git
git branch -M main
git push -u origin main
```

## 📝 Чек-лист действий

- [ ] 1. Выполнить команды Git выше
- [ ] 2. Создать репозиторий на GitHub с именем `evrika-platform`
- [ ] 3. Зарегистрироваться на [render.com](https://render.com)
- [ ] 4. Создать новый Blueprint в Render
- [ ] 5. Подключить GitHub репозиторий
- [ ] 6. Дождаться развертывания (~10-15 минут)
- [ ] 7. Получить URL и протестировать

## 🌐 Ожидаемые URL после развертывания

- **Frontend**: `https://evrika-frontend.onrender.com`
- **Backend API**: `https://evrika-backend.onrender.com`

## 🔧 Тестовые URL для проверки

- API статус: `https://evrika-backend.onrender.com/api/metadata/ages`
- Главная страница: `https://evrika-frontend.onrender.com`

## 💡 Важные моменты

- ⏰ Первый запуск может занять до 30 секунд
- 🔄 Сервисы "засыпают" через 15 минут неактивности
- 📊 750 часов/месяц бесплатно на Render
- 🎯 Для продакшена рекомендуется платный план ($7/месяц)
