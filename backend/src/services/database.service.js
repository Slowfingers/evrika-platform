const { Client } = require('pg');

class DatabaseService {
  constructor() {
    this.db = null;
    this.dbType = 'PostgreSQL';
  }

  async initialize() {
    console.log(`🗄️ Инициализация базы данных: ${this.dbType}`);
    
    if (!process.env.DATABASE_URL) {
      throw new Error('❌ DATABASE_URL не найден в переменных окружения. Требуется PostgreSQL/Neon подключение.');
    }
    
    return this.initializePostgreSQL();
  }

  async initializePostgreSQL() {
    this.db = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
      await this.db.connect();
      console.log('✅ PostgreSQL подключен успешно');
      await this.createTables();
      await this.seedData();
    } catch (error) {
      console.error('❌ Ошибка подключения к PostgreSQL:', error.message);
      throw error;
    }
  }

  async createTables() {
    const tables = [
      // Пользователи
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Карточки приемов
      `CREATE TABLE IF NOT EXISTS cards (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        content TEXT NOT NULL,
        time_minutes INTEGER DEFAULT 5,
        file_url TEXT,
        views INTEGER DEFAULT 0,
        age_groups TEXT DEFAULT '[]',
        skills TEXT DEFAULT '[]',
        stages TEXT DEFAULT '[]',
        types TEXT DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Метаданные - возрастные группы
      `CREATE TABLE IF NOT EXISTS age_groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
      )`,
      
      // Метаданные - навыки
      `CREATE TABLE IF NOT EXISTS skills (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
      )`
    ];

    // PostgreSQL - выполняем запросы через client
    for (const sql of tables) {
      try {
        await this.db.query(sql);
      } catch (error) {
        console.error('❌ Ошибка создания таблицы PostgreSQL:', error.message);
        throw error;
      }
    }
    
    console.log(`✅ Таблицы ${this.dbType} созданы успешно`);
  }

  async seedData() {
    // Создаем/обновляем админа 
    const bcrypt = require('bcryptjs');
    // Надежный пароль: смесь букв, цифр, спецсимволов, длина 16 символов
    const adminPassword = bcrypt.hashSync('Evr1ka@Adm!n2024', 12);
    
    await this.seedDataPostgreSQL(adminPassword);
  }

  async seedDataPostgreSQL(adminPassword) {
    try {
      // Сначала пытаемся создать админа
      await this.db.query(
        `INSERT INTO users (email, name, password_hash, role) 
         VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING`,
        ['admin@evrika.com', 'Администратор', adminPassword, 'admin']
      );

      // Добавляем метаданные - возрастные группы
      const ageGroups = [
        { id: 'primary', name: 'Начальные классы (1-4)', description: 'Учащиеся 1-4 классов' },
        { id: 'secondary', name: 'Старшие классы (5-11)', description: 'Учащиеся 5-11 классов' }
      ];

      for (const group of ageGroups) {
        await this.db.query(
          `INSERT INTO age_groups (id, name, description) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
          [group.id, group.name, group.description]
        );
      }

      // Добавляем метаданные - навыки
      const skills = [
        { id: 'critical', name: 'Критическое мышление', description: 'Развитие критического мышления' },
        { id: 'teamwork', name: 'Командная работа', description: 'Навыки работы в команде' },
        { id: 'reflection', name: 'Рефлексия', description: 'Навыки самоанализа и рефлексии' },
        { id: 'creative', name: 'Креативное мышление', description: 'Развитие творческих способностей' },
        { id: 'systematization', name: 'Систематизация материала', description: 'Навыки структурирования информации' },
        { id: 'communication', name: 'Коммуникативные', description: 'Развитие коммуникативных навыков' }
      ];

      for (const skill of skills) {
        await this.db.query(
          `INSERT INTO skills (id, name, description) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
          [skill.id, skill.name, skill.description]
        );
      }

      console.log('✅ Данные PostgreSQL инициализированы');
    } catch (error) {
      console.error('❌ Ошибка инициализации данных PostgreSQL:', error.message);
      throw error;
    }
  }



  async seedDataPostgreSQL(adminPassword) {
    try {
      // Сначала пытаемся создать админа
      await this.db.query(
        `INSERT INTO users (email, name, password_hash, role) 
         VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING`,
        ['admin@evrika.com', 'Администратор', adminPassword, 'admin']
      );

      // Добавляем метаданные - возрастные группы
      const ageGroups = [
        { id: 'primary', name: 'Начальные классы (1-4)', description: 'Учащиеся 1-4 классов' },
        { id: 'secondary', name: 'Старшие классы (5-11)', description: 'Учащиеся 5-11 классов' }
      ];

      for (const group of ageGroups) {
        await this.db.query(
          `INSERT INTO age_groups (id, name, description) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
          [group.id, group.name, group.description]
        );
      }

      // Добавляем метаданные - навыки
      const skills = [
        { id: 'critical', name: 'Критическое мышление', description: 'Развитие критического мышления' },
        { id: 'teamwork', name: 'Командная работа', description: 'Навыки работы в команде' },
        { id: 'reflection', name: 'Рефлексия', description: 'Навыки самоанализа и рефлексии' },
        { id: 'creative', name: 'Креативное мышление', description: 'Развитие творческих способностей' },
        { id: 'systematization', name: 'Систематизация материала', description: 'Навыки структурирования информации' },
        { id: 'communication', name: 'Коммуникативные', description: 'Развитие коммуникативных навыков' }
      ];

      for (const skill of skills) {
        await this.db.query(
          `INSERT INTO skills (id, name, description) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
          [skill.id, skill.name, skill.description]
        );
      }

      console.log('✅ Данные PostgreSQL инициализированы');
    } catch (error) {
      console.error('❌ Ошибка инициализации данных PostgreSQL:', error.message);
      throw error;
    }
  }

  // Методы для работы с базой данных (PostgreSQL только)
  async execute(sql, params = []) {
    const result = await this.db.query(sql, params);
    return result.rows;
  }

  async get(sql, params = []) {
    const result = await this.db.query(sql, params);
    return result.rows[0] || null;
  }

  async run(sql, params = []) {
    const result = await this.db.query(sql, params);
    return { changes: result.rowCount, lastInsertRowid: result.rows[0]?.id };
  }

  async insert(sql, params = []) {
    // Для PostgreSQL добавляем RETURNING id если его нет
    if (!sql.toLowerCase().includes('returning')) {
      sql += ' RETURNING id';
    }
    const result = await this.db.query(sql, params);
    return result.rows[0]?.id;
  }

  async update(sql, params = []) {
    const result = await this.run(sql, params);
    return result.changes;
  }

  async transaction(callback) {
    try {
      await this.db.query('BEGIN');
      const result = await callback();
      await this.db.query('COMMIT');
      return result;
    } catch (error) {
      await this.db.query('ROLLBACK');
      throw error;
    }
  }

  getDb() {
    return this.db;
  }

  async close() {
    if (this.db) {
      try {
        await this.db.end();
        console.log('✅ PostgreSQL соединение закрыто');
      } catch (error) {
        console.error('❌ Ошибка закрытия PostgreSQL:', error.message);
      }
    }
  }
}

module.exports = new DatabaseService();
