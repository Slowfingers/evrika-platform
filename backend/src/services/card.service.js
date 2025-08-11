const DatabaseService = require('./database.service');

// Функции преобразования английских ID в русские для поиска в базе
function convertEnglishToRussianId(englishId, type) {
  const mappings = {
    ageGroups: {
      'primary': 'начальные-классы',
      'secondary': 'старшие-классы'
    },
    skills: {
      'critical': 'критическое-мышление',
      'teamwork': 'командная-работа', 
      'reflection': 'рефлексия',
      'creative': 'креативное-мышление',
      'systematization': 'систематизация-материала',
      'communication': 'коммуникация'
    },
    stages: {
      'lesson-start': 'начало-урока',
      'new-material': 'объяснение-нового-материала', 
      'practice': 'закрепление',
      'lesson-end': 'конец-урока'
    },
    types: {
      'individual': 'индивидуальная',
      'pair': 'парная',
      'team': 'командная', 
      'frontal': 'фронтальная'
    }
  };
  
  return mappings[type] && mappings[type][englishId] ? mappings[type][englishId] : englishId;
}

class CardService {
  // Получить все карточки
  async getAllCards(filters = {}) {
    try {
      let sql = 'SELECT * FROM cards';
      let params = [];
      let conditions = [];
      let paramIndex = 1;

      // Фильтр по возрастным группам
      if (filters.ageGroupIds && filters.ageGroupIds.length > 0) {
        const ageGroupConditions = filters.ageGroupIds.map(() => `age_groups LIKE $${paramIndex++}`).join(' OR ');
        conditions.push(`(${ageGroupConditions})`);
        filters.ageGroupIds.forEach(id => {
          const russianId = convertEnglishToRussianId(id, 'ageGroups');
          params.push(`%"${russianId}"%`);
        });
      }

      // Фильтр по навыкам
      if (filters.skillIds && filters.skillIds.length > 0) {
        const skillConditions = filters.skillIds.map(() => `skills LIKE $${paramIndex++}`).join(' OR ');
        conditions.push(`(${skillConditions})`);
        filters.skillIds.forEach(id => {
          const russianId = convertEnglishToRussianId(id, 'skills');
          params.push(`%"${russianId}"%`);
        });
      }

      // Фильтр по этапам урока
      if (filters.stageIds && filters.stageIds.length > 0) {
        const stageConditions = filters.stageIds.map(() => `stages LIKE $${paramIndex++}`).join(' OR ');
        conditions.push(`(${stageConditions})`);
        filters.stageIds.forEach(id => {
          const russianId = convertEnglishToRussianId(id, 'stages');
          params.push(`%"${russianId}"%`);
        });
      }

      // Фильтр по типам работы
      if (filters.typeIds && filters.typeIds.length > 0) {
        const typeConditions = filters.typeIds.map(() => `types LIKE $${paramIndex++}`).join(' OR ');
        conditions.push(`(${typeConditions})`);
        filters.typeIds.forEach(id => {
          const russianId = convertEnglishToRussianId(id, 'types');
          params.push(`%"${russianId}"%`);
        });
      }

      // Фильтр по времени выполнения
      if (filters.timeRange) {
        let timeCondition = '';
        switch (filters.timeRange) {
          case '1-5':
            timeCondition = 'time_minutes >= 1 AND time_minutes <= 5';
            break;
          case '6-10':
            timeCondition = 'time_minutes >= 6 AND time_minutes <= 10';
            break;
          case '11-15':
            timeCondition = 'time_minutes >= 11 AND time_minutes <= 15';
            break;
          case '16-20':
            timeCondition = 'time_minutes >= 16 AND time_minutes <= 20';
            break;
          case '21+':
            timeCondition = 'time_minutes >= 21';
            break;
        }
        if (timeCondition) {
          conditions.push(timeCondition);
        }
      }

      // Фильтр по поиску
      if (filters.search) {
        conditions.push(`(title LIKE $${paramIndex} OR description LIKE $${paramIndex + 1} OR content LIKE $${paramIndex + 2})`);
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
        paramIndex += 3;
      }

      // Обратная совместимость с одиночными фильтрами
      if (filters.ageGroupId) {
        const russianId = convertEnglishToRussianId(filters.ageGroupId, 'ageGroups');
        conditions.push(`age_groups LIKE $${paramIndex++}`);
        params.push(`%"${russianId}"%`);
      }

      if (filters.skillId) {
        const russianId = convertEnglishToRussianId(filters.skillId, 'skills');
        conditions.push(`skills LIKE $${paramIndex++}`);
        params.push(`%"${russianId}"%`);
      }

      // Добавляем условия к запросу
      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      // Сортировка
      sql += ' ORDER BY created_at DESC';

      // Пагинация
      if (filters.limit) {
        sql += ` LIMIT $${paramIndex++}`;
        params.push(parseInt(filters.limit));
        
        if (filters.offset) {
          sql += ` OFFSET $${paramIndex++}`;
          params.push(parseInt(filters.offset));
        }
      }

      const rows = await DatabaseService.execute(sql, params);
      const cards = rows.map(row => ({
        ...row,
        age_groups: JSON.parse(row.age_groups || '[]'),
        skills: JSON.parse(row.skills || '[]'),
        stages: JSON.parse(row.stages || '[]'),
        types: JSON.parse(row.types || '[]'),
        aims: JSON.parse(row.aims || '[]')
      }));
      
      return cards;
    } catch (error) {
      console.error('❌ Ошибка получения карточек:', error.message);
      throw error;
    }
  }

  // Получить карточку по ID
  async getCardById(id) {
    try {
      const row = await DatabaseService.get('SELECT * FROM cards WHERE id = $1', [id]);
      
      if (!row) {
        return null;
      }

      const card = {
        ...row,
        age_groups: JSON.parse(row.age_groups || '[]'),
        skills: JSON.parse(row.skills || '[]'),
        stages: JSON.parse(row.stages || '[]'),
        types: JSON.parse(row.types || '[]'),
        aims: JSON.parse(row.aims || '[]')
      };
      return card;
    } catch (error) {
      throw error;
    }
  }

  // Создать карточку
  async createCard(cardData) {
    try {
      const {
        title,
        description,
        content,
        time_minutes = 5,
        file_url = null,
        views = 0,
        age_groups = [],
        skills = [],
        stages = [],
        types = []
      } = cardData;

      const cardId = await DatabaseService.insert(
        `INSERT INTO cards (title, description, content, time_minutes, file_url, views, age_groups, skills, stages, types)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          title,
          description,
          content,
          time_minutes,
          file_url,
          views,
          JSON.stringify(age_groups),
          JSON.stringify(skills),
          JSON.stringify(stages),
          JSON.stringify(types)
        ]
      );

      return { id: cardId, ...cardData };
    } catch (error) {
      throw error;
    }
  }

  // Обновить карточку
  async updateCard(id, cardData) {
    try {
      const {
        title,
        description,
        content,
        time_minutes,
        file_url,
        views,
        age_groups = [],
        skills = [],
        stages = [],
        types = []
      } = cardData;

      const result = await DatabaseService.run(
        `UPDATE cards 
         SET title = $1, description = $2, content = $3, time_minutes = $4, 
             file_url = $5, views = $6,
             age_groups = $7, skills = $8, stages = $9, types = $10,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $11`,
        [
          title,
          description,
          content,
          time_minutes,
          file_url,
          views,
          JSON.stringify(age_groups),
          JSON.stringify(skills),
          JSON.stringify(stages),
          JSON.stringify(types),
          id
        ]
      );

      if (result.changes === 0) {
        throw new Error('Карточка не найдена');
      }

      return { id: parseInt(id), ...cardData };
    } catch (error) {
      throw error;
    }
  }

  // Удалить карточку
  async deleteCard(id) {
    try {
      const result = await DatabaseService.run('DELETE FROM cards WHERE id = $1', [id]);
      
      if (result.changes === 0) {
        throw new Error('Карточка не найдена');
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Увеличить счетчик просмотров
  async incrementViews(id) {
    try {
      await DatabaseService.run('UPDATE cards SET views = views + 1 WHERE id = $1', [id]);
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Получить количество карточек
  async getCardsCount(filters = {}) {
    try {
      let sql = 'SELECT COUNT(*) as count FROM cards';
      let params = [];
      let conditions = [];
      let paramIndex = 1;

      // Применяем те же фильтры, что и в getAllCards
      if (filters.ageGroupIds && filters.ageGroupIds.length > 0) {
        const ageGroupConditions = filters.ageGroupIds.map(() => `age_groups LIKE $${paramIndex++}`).join(' OR ');
        conditions.push(`(${ageGroupConditions})`);
        filters.ageGroupIds.forEach(id => {
          const russianId = convertEnglishToRussianId(id, 'ageGroups');
          params.push(`%"${russianId}"%`);
        });
      }

      if (filters.skillIds && filters.skillIds.length > 0) {
        const skillConditions = filters.skillIds.map(() => `skills LIKE $${paramIndex++}`).join(' OR ');
        conditions.push(`(${skillConditions})`);
        filters.skillIds.forEach(id => {
          const russianId = convertEnglishToRussianId(id, 'skills');
          params.push(`%"${russianId}"%`);
        });
      }

      if (filters.search) {
        conditions.push(`(title LIKE $${paramIndex} OR description LIKE $${paramIndex + 1})`);
        params.push(`%${filters.search}%`, `%${filters.search}%`);
        paramIndex += 2;
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      const row = await DatabaseService.get(sql, params);
      return row.count;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CardService();
