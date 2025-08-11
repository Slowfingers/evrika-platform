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

      // Фильтр по возрастным группам
      if (filters.ageGroupIds && filters.ageGroupIds.length > 0) {
        const ageGroupConditions = filters.ageGroupIds.map(() => 'age_groups LIKE ?').join(' OR ');
        conditions.push(`(${ageGroupConditions})`);
        filters.ageGroupIds.forEach(id => {
          const russianId = convertEnglishToRussianId(id, 'ageGroups');
          params.push(`%"${russianId}"%`);
        });
      }

      // Фильтр по навыкам
      if (filters.skillIds && filters.skillIds.length > 0) {
        const skillConditions = filters.skillIds.map(() => 'skills LIKE ?').join(' OR ');
        conditions.push(`(${skillConditions})`);
        filters.skillIds.forEach(id => {
          const russianId = convertEnglishToRussianId(id, 'skills');
          params.push(`%"${russianId}"%`);
        });
      }

      // Фильтр по этапам урока
      if (filters.stageIds && filters.stageIds.length > 0) {
        const stageConditions = filters.stageIds.map(() => 'stages LIKE ?').join(' OR ');
        conditions.push(`(${stageConditions})`);
        filters.stageIds.forEach(id => {
          const russianId = convertEnglishToRussianId(id, 'stages');
          params.push(`%"${russianId}"%`);
        });
      }

      // Фильтр по типам работы
      if (filters.typeIds && filters.typeIds.length > 0) {
        const typeConditions = filters.typeIds.map(() => 'types LIKE ?').join(' OR ');
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
        conditions.push('(title LIKE ? OR description LIKE ? OR content LIKE ?)');
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Обратная совместимость с одиночными фильтрами
      if (filters.ageGroupId) {
        const russianId = convertEnglishToRussianId(filters.ageGroupId, 'ageGroups');
        conditions.push('age_groups LIKE ?');
        params.push(`%"${russianId}"%`);
      }

      if (filters.skillId) {
        const russianId = convertEnglishToRussianId(filters.skillId, 'skills');
        conditions.push('skills LIKE ?');
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
        sql += ' LIMIT ?';
        params.push(parseInt(filters.limit));
        
        if (filters.offset) {
          sql += ' OFFSET ?';
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
    return new Promise((resolve, reject) => {
      const db = DatabaseService.getDb();
      
      db.get('SELECT * FROM cards WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          const card = {
            ...row,
            age_groups: JSON.parse(row.age_groups || '[]'),
            skills: JSON.parse(row.skills || '[]'),
            stages: JSON.parse(row.stages || '[]'),
            types: JSON.parse(row.types || '[]'),
            aims: JSON.parse(row.aims || '[]')
          };
          resolve(card);
        }
      });
    });
  }

  // Создать карточку
  async createCard(cardData) {
    return new Promise((resolve, reject) => {
      const db = DatabaseService.getDb();
      
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

      db.run(
        `INSERT INTO cards (title, description, content, time_minutes, file_url, views, age_groups, skills, stages, types)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...cardData });
          }
        }
      );
    });
  }

  // Обновить карточку
  async updateCard(id, cardData) {
    return new Promise((resolve, reject) => {
      const db = DatabaseService.getDb();
      
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

      db.run(
        `UPDATE cards 
         SET title = ?, description = ?, content = ?, time_minutes = ?, 
             file_url = ?, views = ?,
             age_groups = ?, skills = ?, stages = ?, types = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
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
        ],
        function(err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Карточка не найдена'));
          } else {
            resolve({ id: parseInt(id), ...cardData });
          }
        }
      );
    });
  }

  // Удалить карточку
  async deleteCard(id) {
    return new Promise((resolve, reject) => {
      const db = DatabaseService.getDb();
      
      db.run('DELETE FROM cards WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('Карточка не найдена'));
        } else {
          resolve({ success: true });
        }
      });
    });
  }

  // Увеличить счетчик просмотров
  async incrementViews(id) {
    return new Promise((resolve, reject) => {
      const db = DatabaseService.getDb();
      
      db.run('UPDATE cards SET views = views + 1 WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true });
        }
      });
    });
  }

  // Получить количество карточек
  async getCardsCount(filters = {}) {
    return new Promise((resolve, reject) => {
      const db = DatabaseService.getDb();
      let sql = 'SELECT COUNT(*) as count FROM cards';
      let params = [];
      let conditions = [];

      // Применяем те же фильтры, что и в getAllCards
      if (filters.ageGroupIds && filters.ageGroupIds.length > 0) {
        conditions.push(`age_groups LIKE '%' || ? || '%'`);
        params.push(...filters.ageGroupIds);
      }

      if (filters.skillIds && filters.skillIds.length > 0) {
        conditions.push(`skills LIKE '%' || ? || '%'`);
        params.push(...filters.skillIds);
      }

      if (filters.search) {
        conditions.push(`(title LIKE ? OR description LIKE ?)`);
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }
}

module.exports = new CardService();
