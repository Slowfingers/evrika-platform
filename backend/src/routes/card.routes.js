const express = require('express');
const CardService = require('../services/card.service');
const AuthService = require('../services/auth.service');

const router = express.Router();

// Получить все карточки (публичный доступ)
router.get('/', async (req, res) => {
  try {
    const filters = {
      ageGroupIds: req.query.ageGroupIds ? 
        (Array.isArray(req.query.ageGroupIds) ? req.query.ageGroupIds : [req.query.ageGroupIds]) : 
        undefined,
      skillIds: req.query.skillIds ? 
        (Array.isArray(req.query.skillIds) ? req.query.skillIds : [req.query.skillIds]) : 
        undefined,
      stageIds: req.query.stageIds ?
        (Array.isArray(req.query.stageIds) ? req.query.stageIds : [req.query.stageIds]) :
        undefined,
      typeIds: req.query.typeIds ?
        (Array.isArray(req.query.typeIds) ? req.query.typeIds : [req.query.typeIds]) :
        undefined,
      timeRange: req.query.timeRange,
      search: req.query.search,
      limit: req.query.limit,
      offset: req.query.offset
    };

    const cards = await CardService.getAllCards(filters);
    const total = await CardService.getCardsCount(filters);

    res.json({
      success: true,
      data: cards,
      total,
      count: cards.length
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Получить карточку по ID (публичный доступ)
router.get('/:id', async (req, res) => {
  try {
    const card = await CardService.getCardById(req.params.id);
    
    if (!card) {
      return res.status(404).json({ 
        error: 'Карточка не найдена' 
      });
    }

    // Увеличиваем счетчик просмотров
    await CardService.incrementViews(req.params.id);

    res.json({
      success: true,
      data: card
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
});

// Создать карточку (только для админов)
router.post('/', 
  AuthService.authenticateToken, 
  AuthService.requireAdmin, 
  async (req, res) => {
    try {
      const card = await CardService.createCard(req.body);
      res.status(201).json({
        success: true,
        data: card,
        message: 'Карточка успешно создана'
      });
    } catch (error) {
      res.status(400).json({ 
        error: error.message 
      });
    }
  }
);

// Обновить карточку (только для админов)
router.put('/:id', 
  AuthService.authenticateToken, 
  AuthService.requireAdmin, 
  async (req, res) => {
    try {
      const card = await CardService.updateCard(req.params.id, req.body);
      res.json({
        success: true,
        data: card,
        message: 'Карточка успешно обновлена'
      });
    } catch (error) {
      if (error.message === 'Карточка не найдена') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }
);

// Удалить карточку (только для админов)
router.delete('/:id', 
  AuthService.authenticateToken, 
  AuthService.requireAdmin, 
  async (req, res) => {
    try {
      await CardService.deleteCard(req.params.id);
      res.json({
        success: true,
        message: 'Карточка успешно удалена'
      });
    } catch (error) {
      if (error.message === 'Карточка не найдена') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }
);

module.exports = router;
