// Предопределенные интервалы времени
export const TIME_INTERVALS = [
  { id: 'up-to-2', label: 'до 2 минут', value: 2, min: 0, max: 2 },
  { id: '3-5', label: '3-5 минут', value: 4, min: 3, max: 5 },
  { id: '5-10', label: '5-10 минут', value: 7, min: 5, max: 10 },
  { id: '15-20', label: '15-20 минут', value: 17, min: 15, max: 20 },
  { id: '25-30', label: '25-30 минут', value: 27, min: 25, max: 30 },
  { id: 'full-lesson', label: 'весь урок', value: 45, min: 40, max: 50 }
];

/**
 * Получить интервал по значению времени в минутах
 * @param {number} minutes - количество минут
 * @returns {object} - объект интервала или null
 */
export function getIntervalByMinutes(minutes) {
  return TIME_INTERVALS.find(interval => 
    minutes >= interval.min && minutes <= interval.max
  ) || null;
}

/**
 * Получить интервал по ID
 * @param {string} id - ID интервала
 * @returns {object} - объект интервала или null
 */
export function getIntervalById(id) {
  return TIME_INTERVALS.find(interval => interval.id === id) || null;
}

/**
 * Форматировать время для отображения
 * @param {number} minutes - количество минут
 * @returns {string} - отформатированная строка
 */
export function formatTimeDisplay(minutes) {
  const interval = getIntervalByMinutes(minutes);
  if (interval) {
    return interval.label;
  }
  
  // Fallback для нестандартных значений
  if (minutes < 60) {
    return `${minutes} мин`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}ч ${remainingMinutes}мин` : `${hours}ч`;
}
