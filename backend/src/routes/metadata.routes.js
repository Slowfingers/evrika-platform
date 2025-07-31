const express = require('express');
const DatabaseService = require('../services/database.service');

const router = express.Router();

// Получить возрастные группы
router.get('/age-groups', (req, res) => {
  const db = DatabaseService.getDb();
  
  db.all('SELECT * FROM age_groups ORDER BY id', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({
        success: true,
        data: rows
      });
    }
  });
});

// Получить навыки
router.get('/skills', (req, res) => {
  const db = DatabaseService.getDb();
  
  db.all('SELECT * FROM skills ORDER BY id', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({
        success: true,
        data: rows
      });
    }
  });
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
