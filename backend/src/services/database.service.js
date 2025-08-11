const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
const path = require('path');

class DatabaseService {
  constructor() {
    this.db = null;
    this.isPostgreSQL = !!process.env.DATABASE_URL;
    this.dbType = this.isPostgreSQL ? 'PostgreSQL' : 'SQLite';
  }

  async initialize() {
    console.log(`🗄️ Инициализация базы данных: ${this.dbType}`);
    
    if (this.isPostgreSQL) {
      return this.initializePostgreSQL();
    } else {
      return this.initializeSQLite();
    }
  }

  async initializeSQLite() {
    const dbPath = path.join(__dirname, '../../evrika.db');
    
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, async (err) => {
        if (err) {
          console.error('❌ Ошибка подключения к SQLite:', err.message);
          reject(err);
        } else {
          console.log('✅ SQLite подключен успешно');
          try {
            await this.createTables();
            await this.seedData();
            resolve();
          } catch (error) {
            console.error('❌ Ошибка инициализации SQLite:', error.message);
            reject(error);
          }
        }
      });
    });
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
    const sqliteTables = [
      // Пользователи
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Карточки приемов
      `CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

    const postgresqlTables = [
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

    const tables = this.isPostgreSQL ? postgresqlTables : sqliteTables;

    if (this.isPostgreSQL) {
      // PostgreSQL - выполняем запросы через client
      for (const sql of tables) {
        try {
          await this.db.query(sql);
        } catch (error) {
          console.error('❌ Ошибка создания таблицы PostgreSQL:', error.message);
          throw error;
        }
      }
    } else {
      // SQLite - выполняем запросы через run
      for (const sql of tables) {
        await new Promise((resolve, reject) => {
          this.db.run(sql, (err) => {
            if (err) {
              console.error('❌ Ошибка создания таблицы SQLite:', err.message);
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }
    }
    
    console.log(`✅ Таблицы ${this.dbType} созданы успешно`);
  }

  async seedData() {
    // Создаем/обновляем админа по умолчанию
    const bcrypt = require('bcryptjs');
    // Надежный пароль: смесь букв, цифр, спецсимволов, длина 16 символов
    const adminPassword = bcrypt.hashSync('Evr1ka@Adm!n2024', 12);
    
    if (this.isPostgreSQL) {
      await this.seedDataPostgreSQL(adminPassword);
    } else {
      await this.seedDataSQLite(adminPassword);
    }
  }

  async seedDataSQLite(adminPassword) {
    // Сначала пытаемся создать админа
    await new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR IGNORE INTO users (email, name, password_hash, role) 
         VALUES (?, ?, ?, ?)`,
        ['admin@evrika.com', 'Администратор', adminPassword, 'admin'],
        (err) => {
          if (err) {
            console.error('❌ Ошибка создания админа:', err.message);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
    
    // Затем обновляем пароль (на случай если админ уже существует)
    await new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE users SET password_hash = ? WHERE email = ?`,
        [adminPassword, 'admin@evrika.com'],
        (err) => {
          if (err) {
            console.error('❌ Ошибка обновления пароля:', err.message);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });

    // Добавляем метаданные - возрастные группы
    const ageGroups = [
      { id: 'primary', name: 'Начальные классы (1-4)', description: 'Учащиеся 1-4 классов' },
      { id: 'secondary', name: 'Старшие классы (5-11)', description: 'Учащиеся 5-11 классов' }
    ];

    for (const group of ageGroups) {
      await new Promise((resolve, reject) => {
        this.db.run(
          `INSERT OR IGNORE INTO age_groups (id, name, description) VALUES (?, ?, ?)`,
          [group.id, group.name, group.description],
          (err) => {
            if (err) {
              console.error('❌ Ошибка добавления возрастной группы:', err.message);
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });
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
      await new Promise((resolve, reject) => {
        this.db.run(
          `INSERT OR IGNORE INTO skills (id, name, description) VALUES (?, ?, ?)`,
          [skill.id, skill.name, skill.description],
          (err) => {
            if (err) {
              console.error('❌ Ошибка добавления навыка:', err.message);
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });
    }

    console.log('✅ Данные SQLite инициализированы');
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

  // Методы для работы с базой данных
  async execute(sql, params = []) {
    if (this.isPostgreSQL) {
      const result = await this.db.query(sql, params);
      return result.rows;
    } else {
      return new Promise((resolve, reject) => {
        this.db.all(sql, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    }
  }

  async get(sql, params = []) {
    if (this.isPostgreSQL) {
      const result = await this.db.query(sql, params);
      return result.rows[0] || null;
    } else {
      return new Promise((resolve, reject) => {
        this.db.get(sql, params, (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    }
  }

  async run(sql, params = []) {
    if (this.isPostgreSQL) {
      const result = await this.db.query(sql, params);
      return { changes: result.rowCount, lastInsertRowid: result.rows[0]?.id };
    } else {
      return new Promise((resolve, reject) => {
        this.db.run(sql, params, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes, lastInsertRowid: this.lastID });
          }
        });
      });
    }
  }

  async insert(sql, params = []) {
    if (this.isPostgreSQL) {
      // Для PostgreSQL добавляем RETURNING id если его нет
      if (!sql.toLowerCase().includes('returning')) {
        sql += ' RETURNING id';
      }
      const result = await this.db.query(sql, params);
      return result.rows[0]?.id;
    } else {
      const result = await this.run(sql, params);
      return result.lastInsertRowid;
    }
  }

  async update(sql, params = []) {
    const result = await this.run(sql, params);
    return result.changes;
  }

  async transaction(callback) {
    if (this.isPostgreSQL) {
      try {
        await this.db.query('BEGIN');
        const result = await callback();
        await this.db.query('COMMIT');
        return result;
      } catch (error) {
        await this.db.query('ROLLBACK');
        throw error;
      }
    } else {
      return new Promise((resolve, reject) => {
        this.db.serialize(() => {
          this.db.run('BEGIN TRANSACTION');
          
          callback()
            .then((result) => {
              this.db.run('COMMIT', (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(result);
                }
              });
            })
            .catch((error) => {
              this.db.run('ROLLBACK', () => {
                reject(error);
              });
            });
        });
      });
    }
  }

  getDb() {
    return this.db;
  }

  async close() {
    if (this.db) {
      if (this.isPostgreSQL) {
        try {
          await this.db.end();
          console.log('✅ PostgreSQL соединение закрыто');
        } catch (error) {
          console.error('❌ Ошибка закрытия PostgreSQL:', error.message);
        }
      } else {
        return new Promise((resolve) => {
          this.db.close((err) => {
            if (err) {
              console.error('❌ Ошибка закрытия SQLite:', err.message);
            } else {
              console.log('✅ SQLite база данных закрыта');
            }
            resolve();
          });
        });
      }
    }
  }
}

module.exports = new DatabaseService();
