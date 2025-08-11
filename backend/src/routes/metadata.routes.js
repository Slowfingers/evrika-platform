const express = require('express');
const DatabaseService = require('../services/database.service');

const router = express.Router();

// Получить возрастные группы
router.get('/age-groups', async (req, res) => {
  try {
    const rows = await DatabaseService.execute('SELECT * FROM age_groups ORDER BY id');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('❌ Ошибка получения возрастных групп:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Получить навыки
router.get('/skills', async (req, res) => {
  try {
    const rows = await DatabaseService.execute('SELECT * FROM skills ORDER BY id');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('❌ Ошибка получения навыков:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Получить предопределенные данные для форм
router.get('/form-data', (req, res) => {
  const formData = {
    stages: [
      { id: 'start', name: 'Начало урока' },
      { id: 'explanation', name: 'Объяснение нового материала' },
      { id: 'practice', name: 'Закрепление' },
      { id: 'end', name: 'Конец урока' }
    ],
    types: [
      { id: 'individual', name: 'Индивидуальная работа' },
      { id: 'pair', name: 'Парная работа' },
      { id: 'team', name: 'Командная работа' },
      { id: 'frontal', name: 'Фронтальная работа' }
    ],
    aims: [
      { id: 'develop', name: 'Развитие навыков' },
      { id: 'consolidate', name: 'Закрепление знаний' },
      { id: 'diagnose', name: 'Диагностика' },
      { id: 'creative', name: 'Творческое развитие' }
    ]
  };

  res.json({
    success: true,
    data: formData
  });
});

module.exports = router;
