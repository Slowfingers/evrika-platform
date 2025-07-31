const express = require('express');
const AuthService = require('../services/auth.service');

const router = express.Router();

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { email, name, password, role } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ 
        error: 'Email, имя и пароль обязательны' 
      });
    }

    const user = await AuthService.register(email, name, password, role);
    res.status(201).json({ 
      success: true, 
      user,
      message: 'Пользователь успешно зарегистрирован' 
    });
  } catch (error) {
    res.status(400).json({ 
      error: error.message 
    });
  }
});

// Вход
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email и пароль обязательны' 
      });
    }

    const result = await AuthService.login(email, password);
    res.json({ 
      success: true, 
      ...result,
      message: 'Успешный вход в систему' 
    });
  } catch (error) {
    res.status(401).json({ 
      error: error.message 
    });
  }
});

// Получение текущего пользователя
router.get('/me', AuthService.authenticateToken, async (req, res) => {
  try {
    const user = await AuthService.getUserByToken(
      req.headers.authorization.split(' ')[1]
    );
    res.json({ 
      success: true, 
      user 
    });
  } catch (error) {
    res.status(401).json({ 
      error: error.message 
    });
  }
});

// Выход (просто подтверждение)
router.post('/logout', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Успешный выход из системы' 
  });
});

module.exports = router;
