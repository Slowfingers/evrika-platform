const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseService {
  constructor() {
    this.db = null;
  }

  async initialize() {
    const dbPath = path.join(__dirname, '../../evrika.db');
    
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, async (err) => {
        if (err) {
          console.error('❌ Ошибка подключения к базе данных:', err.message);
          reject(err);
        } else {
          try {
            await this.createTables();
            await this.seedData();
            resolve();
          } catch (error) {
            console.error('❌ Ошибка инициализации базы данных:', error.message);
            reject(error);
          }
        }
      });
    });
  }

  async createTables() {
    const tables = [
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

    // Создаем таблицы последовательно
    for (const sql of tables) {
      await new Promise((resolve, reject) => {
        this.db.run(sql, (err) => {
          if (err) {
            console.error('❌ Ошибка создания таблицы:', err.message);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    

  }

  async seedData() {
    // Создаем/обновляем админа по умолчанию
    const bcrypt = require('bcryptjs');
    // Надежный пароль: смесь букв, цифр, спецсимволов, длина 16 символов
    const adminPassword = bcrypt.hashSync('Evr1ka@Adm!n2024', 12);
    
    // Сначала пытаемся создать админа
    await new Promise((resolve, reject) => {
      this.db.run(
        `INSERT OR IGNORE INTO users (email, name, password_hash, role) 
         VALUES (?, ?, ?, ?)`,
        ['admin@evrika.com', 'Администратор', adminPassword, 'admin'],
        (err) => {
          if (err) {
            // Админ уже существует, это нормально
          }
          resolve();
        }
      );
    });
    
    // Затем обновляем пароль на случай, если админ уже существует
    await new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE users SET password_hash = ? WHERE email = ?`,
        [adminPassword, 'admin@evrika.com'],
        (err) => {
          if (err) {
            // Ошибка обновления пароля
          } else {
            // Пароль успешно обновлен
          }
          resolve();
        }
      );
    });

    // Добавляем базовые метаданные
    const ageGroups = [
      { id: 'primary', name: 'Начальные классы (1-4)', description: 'Младшие школьники' },
      { id: 'secondary', name: 'Старшие классы (5-11)', description: 'Старшие школьники' }
    ];

    const skills = [
      { id: 'critical', name: 'Критическое мышление', description: 'Анализ и оценка информации' },
      { id: 'creative', name: 'Креативное мышление', description: 'Творческий подход к решению задач' },
      { id: 'communication', name: 'Коммуникация', description: 'Навыки общения и взаимодействия' },
      { id: 'teamwork', name: 'Командная работа', description: 'Сотрудничество в группе' },
      { id: 'reflection', name: 'Рефлексия', description: 'Самоанализ и осмысление' },
      { id: 'systematization', name: 'Систематизация', description: 'Структурирование материала' }
    ];

    ageGroups.forEach(group => {
      this.db.run(
        `INSERT OR IGNORE INTO age_groups (id, name, description) VALUES (?, ?, ?)`,
        [group.id, group.name, group.description]
      );
    });

    skills.forEach(skill => {
      this.db.run(
        `INSERT OR IGNORE INTO skills (id, name, description) VALUES (?, ?, ?)`,
        [skill.id, skill.name, skill.description]
      );
    });


  }

  getDb() {
    return this.db;
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = new DatabaseService();
