const express = require('express');
const cors = require('cors');
const path = require('path');

// Импорт сервисов
const DatabaseService = require('./services/database.service');
const AuthService = require('./services/auth.service');

// Импорт маршрутов
const authRoutes = require('./routes/auth.routes');
const cardRoutes = require('./routes/card.routes');
const metadataRoutes = require('./routes/metadata.routes');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://evrikaedu.online',
    'https://evrika-frontend.onrender.com',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());

// Асинхронная инициализация сервера
async function startServer() {
  try {
    // Инициализация базы данных
    await DatabaseService.initialize();
    
    // Маршруты
    app.use('/api/auth', authRoutes);
    app.use('/api/cards', cardRoutes);
    app.use('/api/metadata', metadataRoutes);
    
    // Базовый маршрут
    app.get('/', (req, res) => {
      res.json({ 
        message: 'EvrikaEdu Backend API', 
        version: '1.0.0',
        endpoints: {
          auth: '/api/auth',
          cards: '/api/cards',
          metadata: '/api/metadata'
        }
      });
    });
    
    // Запуск сервера
    app.listen(PORT, () => {
      console.log(`🚀 EvrikaEdu Backend запущен на порту ${PORT}`);
      console.log(`📊 API доступен по адресу: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error.message);
    process.exit(1);
  }
}

// Обработка неперехваченных исключений
process.on('uncaughtException', (error) => {
  console.error('❌ Неперехваченное исключение:', error);
  console.error('Stack trace:', error.stack);
  // Не завершаем процесс сразу, даем время для логирования
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Обработка неперехваченных отклонений промисов
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Неперехваченное отклонение промиса:', reason);
  console.error('Promise:', promise);
  // Не завершаем процесс для отклонений промисов
});

// Обработка сигналов завершения
process.on('SIGTERM', () => {
  console.log('🛑 Получен сигнал SIGTERM, завершение сервера...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Получен сигнал SIGINT, завершение сервера...');
  process.exit(0);
});

// Запускаем сервер
startServer();

module.exports = app;
