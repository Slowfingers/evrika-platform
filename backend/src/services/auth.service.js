const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DatabaseService = require('./database.service');

const JWT_SECRET = process.env.JWT_SECRET || 'evrika-secret-key-2024';

class AuthService {
  constructor() {
    // Хранение попыток входа для защиты от брутфорса
    this.loginAttempts = new Map();
    this.MAX_ATTEMPTS = 5;
    this.LOCKOUT_TIME = 15 * 60 * 1000; // 15 минут
  }

  // Проверка на превышение лимита попыток входа
  isLockedOut(email) {
    const attempts = this.loginAttempts.get(email);
    if (!attempts) return false;
    
    if (attempts.count >= this.MAX_ATTEMPTS) {
      const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
      if (timeSinceLastAttempt < this.LOCKOUT_TIME) {
        return true;
      } else {
        // Сброс счетчика после истечения времени блокировки
        this.loginAttempts.delete(email);
        return false;
      }
    }
    return false;
  }

  // Регистрация неудачной попытки входа
  recordFailedAttempt(email) {
    const attempts = this.loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
    attempts.count++;
    attempts.lastAttempt = Date.now();
    this.loginAttempts.set(email, attempts);
  }

  // Сброс счетчика попыток при успешном входе
  resetFailedAttempts(email) {
    this.loginAttempts.delete(email);
  }
  // Регистрация пользователя
  async register(email, name, password, role = 'user') {
    return new Promise((resolve, reject) => {
      const db = DatabaseService.getDb();
      const passwordHash = bcrypt.hashSync(password, 10);

      db.run(
        `INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)`,
        [email, name, passwordHash, role],
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              reject(new Error('Пользователь с таким email уже существует'));
            } else {
              reject(err);
            }
          } else {
            const user = { id: this.lastID, email, name, role };
            resolve(user);
          }
        }
      );
    });
  }

  // Вход пользователя
  async login(email, password) {
    return new Promise((resolve, reject) => {
      // Проверка на блокировку аккаунта
      if (this.isLockedOut(email)) {
        const attempts = this.loginAttempts.get(email);
        const timeLeft = Math.ceil((this.LOCKOUT_TIME - (Date.now() - attempts.lastAttempt)) / 60000);
        reject(new Error(`Аккаунт заблокирован на ${timeLeft} мин. из-за множественных неудачных попыток входа`));
        return;
      }

      const db = DatabaseService.getDb();

      db.get(
        `SELECT * FROM users WHERE email = ?`,
        [email],
        (err, user) => {
          if (err) {
            reject(err);
          } else if (!user) {
            this.recordFailedAttempt(email);
            reject(new Error('Неверные данные для входа'));
          } else if (!bcrypt.compareSync(password, user.password_hash)) {
            this.recordFailedAttempt(email);
            reject(new Error('Неверные данные для входа'));
          } else {
            // Сброс неудачных попыток при успешном входе
            this.resetFailedAttempts(email);
            
            const token = jwt.sign(
              { id: user.id, email: user.email, role: user.role },
              JWT_SECRET,
              { expiresIn: '7d' }
            );

            resolve({
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
              },
              token
            });
          }
        }
      );
    });
  }

  // Получение пользователя по токену
  async getUserByToken(token) {
    return new Promise((resolve, reject) => {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const db = DatabaseService.getDb();

        db.get(
          `SELECT id, email, name, role FROM users WHERE id = ?`,
          [decoded.id],
          (err, user) => {
            if (err) {
              reject(err);
            } else if (!user) {
              reject(new Error('Пользователь не найден'));
            } else {
              resolve(user);
            }
          }
        );
      } catch (error) {
        reject(new Error('Недействительный токен'));
      }
    });
  }

  // Middleware для проверки аутентификации
  authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Недействительный токен' });
      }
      req.user = user;
      next();
    });
  }

  // Middleware для проверки роли админа
  requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Требуются права администратора' });
    }
    next();
  }
}

module.exports = new AuthService();
