import { formatTimeDisplay } from './time-intervals.js';
import { getAgeGroupNames, getSkillNames, getStageNames, getTypeNames } from './localization.js';

/**
 * Экспорт урока в PDF через браузерную печать
 */
export function exportLessonToPDF(lessonData) {
  try {
    // Проверяем, что данные урока корректны
    if (!lessonData) {
      throw new Error('Данные урока отсутствуют');
    }
    
    if (!lessonData.cards || lessonData.cards.length === 0) {
      throw new Error('В уроке нет выбранных приёмов');
    }
    
    // Создаем HTML контент для PDF
    const printContent = createPrintableContent(lessonData);
    
    // Создаем полный HTML документ
    const fullHTML = createFullHTMLDocument(lessonData, printContent);
    
    // Открываем новое окно с содержимым для печати
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      // Если всплывающие окна заблокированы, скачиваем как HTML файл
      downloadAsHTMLFile(fullHTML, lessonData.topic);
      return;
    }
    
    // Записываем HTML в новое окно
    printWindow.document.write(fullHTML);
    printWindow.document.close();
    
    // Ждем загрузки и открываем диалог печати
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
        // Закрываем окно после печати (опционально)
        // printWindow.close();
      }, 500);
    };
    
  } catch (error) {
    console.error('📄 PDF Export: Error during export:', error);
    alert('Произошла ошибка при экспорте в PDF: ' + error.message);
  }
}

/**
 * Скачивает HTML файл как резервный вариант
 */
function downloadAsHTMLFile(htmlContent, topicName) {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `план-урока-${topicName || 'без-названия'}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
  
  alert('HTML файл плана урока скачан. Откройте его в браузере и используйте Ctrl+P для печати в PDF.');
}

/**
 * Создает полный HTML документ для экспорта
 */
function createFullHTMLDocument(lessonData, printContent) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>План урока - ${lessonData.topic || 'Без названия'}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .lesson-info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .goals-section, .description-section {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
        }
        .lesson-stage {
          margin-bottom: 20px;
          border-left: 3px solid #2563eb;
          background: #f9fafb;
        }
        .stage-header {
          background: #2563eb;
          color: white;
          padding: 8px 15px;
          font-weight: bold;
          font-size: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .stage-time {
          font-size: 12px;
          opacity: 0.9;
        }
        .stage-cards {
          padding: 0;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-top: 15px;
        }
        .info-item {
          display: flex;
          flex-direction: column;
        }
        .info-label {
          font-weight: bold;
          color: #374151;
          margin-bottom: 5px;
        }
        .info-value {
          color: #6b7280;
        }
        .techniques-section {
          margin-top: 30px;
        }
        .technique {
          padding: 12px 15px;
          margin: 0;
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }
        .technique:last-child {
          border-bottom: none;
        }
        .technique-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .technique-title {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }
        .technique-time {
          color: #6b7280;
          font-size: 12px;
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .technique-description {
          color: #4b5563;
          margin: 4px 0;
          font-size: 13px;
          line-height: 1.4;
        }
        .technique-content {
          background: #f9fafb;
          padding: 8px;
          border-radius: 4px;
          margin-top: 6px;
          font-size: 12px;
          line-height: 1.3;
        }
        .technique-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }
        .meta-tag {
          background: #e5e7eb;
          color: #374151;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
        }
        .meta-tag.stage {
          background: #dbeafe;
          color: #1e40af;
        }
        .meta-tag.type {
          background: #d1fae5;
          color: #065f46;
        }
        .meta-tag.skill {
          background: #fef3c7;
          color: #92400e;
        }
        .summary {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          padding: 12px;
          border-radius: 6px;
          margin-top: 20px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }
        .summary-item {
          text-align: center;
        }
        .summary-label {
          display: block;
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 2px;
        }
        .summary-value {
          font-weight: bold;
          color: #0369a1;
          font-size: 14px;
        }
        @media print {
          body { margin: 0; padding: 10px; font-size: 12px; }
          .lesson-stage { break-inside: avoid; }
          .technique { break-inside: avoid; }
          .header { margin-bottom: 15px; }
          .lesson-info { margin-bottom: 15px; padding: 10px; }
        }
      </style>
    </head>
    <body>
      ${printContent}
    </body>
    </html>
  `;
}

/**
 * Создает HTML контент для печати
 */
function createPrintableContent(lessonData) {
  const { subject, topic, grade, description, goals, lessonStages, totalTime } = lessonData;
  
  // Подсчитываем общее количество карточек и время
  let totalCards = 0;
  let calculatedTotalTime = 0;
  
  if (lessonStages) {
    Object.values(lessonStages).forEach(stage => {
      if (stage.cards) {
        totalCards += stage.cards.length;
        calculatedTotalTime += stage.totalTime || 0;
      }
    });
  }
  
  const finalTotalTime = totalTime || calculatedTotalTime;
  
  return `
    <div class="header">
      <h1>План урока</h1>
      <p style="margin: 0; color: #6b7280;">Создано с помощью платформы EvrikaEdu</p>
    </div>

    <div class="lesson-info">
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Предмет:</span>
          <span class="info-value">${subject || 'Не указан'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Класс:</span>
          <span class="info-value">${grade || 'Не указан'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Тема урока:</span>
          <span class="info-value">${topic || 'Не указана'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Общее время:</span>
          <span class="info-value">${finalTotalTime} мин</span>
        </div>
      </div>
      
      ${goals ? `
        <div class="goals-section">
          <span class="info-label">Цели урока:</span>
          <div class="info-value">${goals.replace(/\n/g, '<br>')}</div>
        </div>
      ` : ''}
      
      ${description ? `
        <div class="description-section">
          <span class="info-label">Описание:</span>
          <div class="info-value">${description.replace(/\n/g, '<br>')}</div>
        </div>
      ` : ''}
    </div>

    ${lessonStages ? createLessonStagesHTML(lessonStages) : ''}
    
    ${totalCards > 0 ? `
      <div class="summary">
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">Приёмов:</span>
            <span class="summary-value">${totalCards}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Время:</span>
            <span class="summary-value">${finalTotalTime} мин</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Средняя длительность:</span>
            <span class="summary-value">${Math.round(finalTotalTime / totalCards)} мин</span>
          </div>
        </div>
      </div>
    ` : ''}
  `;
}

/**
 * Создает HTML для этапов урока
 */
function createLessonStagesHTML(lessonStages) {
  const stageNames = {
    'начало-урока': 'Начало урока',
    'объяснение-нового-материала': 'Объяснение нового материала', 
    'закрепление': 'Закрепление',
    'конец-урока': 'Конец урока'
  };
  
  let html = '';
  
  Object.entries(lessonStages).forEach(([stageKey, stageData]) => {
    if (stageData.cards && stageData.cards.length > 0) {
      const stageName = stageNames[stageKey] || stageKey;
      const stageTime = stageData.totalTime || 0;
      
      html += `
        <div class="lesson-stage">
          <div class="stage-header">
            <span>${stageName}</span>
            <span class="stage-time">${stageTime} мин</span>
          </div>
          <div class="stage-cards">
            ${stageData.cards.map((card, index) => createCompactTechniqueHTML(card, index + 1)).join('')}
          </div>
        </div>
      `;
    }
  });
  
  return html;
}

/**
 * Создает компактный HTML для карточки в этапе урока
 */
function createCompactTechniqueHTML(card, index) {
  try {
    const timeMinutes = card.timeMinutes || card.time_minutes || 0;
    
    // Безопасная обработка метаданных
    const stagesText = (card.stageIds && Array.isArray(card.stageIds)) ? getStageNames(card.stageIds) : '';
    const typesText = (card.typeIds && Array.isArray(card.typeIds)) ? getTypeNames(card.typeIds) : '';
    const skillsText = (card.skillIds && Array.isArray(card.skillIds)) ? getSkillNames(card.skillIds) : '';
    
    let ageGroupsText = '';
    if (card.ageGroups) {
      if (Array.isArray(card.ageGroups)) {
        ageGroupsText = getAgeGroupNames(card.ageGroups);
      } else if (typeof card.ageGroups === 'string') {
        ageGroupsText = card.ageGroups;
      }
    }

    return `
      <div class="technique">
        <div class="technique-header">
          <h4 class="technique-title">${card.title || 'Без названия'}</h4>
          <span class="technique-time">${formatTimeDisplay(timeMinutes)}</span>
        </div>
        
        ${card.description ? `
          <p class="technique-description">${card.description}</p>
        ` : ''}
        
        ${card.content ? `
          <div class="technique-content">
            ${card.content.replace(/\n/g, '<br>')}
          </div>
        ` : ''}

        ${(ageGroupsText || stagesText || typesText || skillsText) ? `
          <div class="technique-meta">
            ${ageGroupsText ? `<span class="meta-tag age-group">${ageGroupsText}</span>` : ''}
            ${stagesText ? `<span class="meta-tag stage">${stagesText}</span>` : ''}
            ${typesText ? `<span class="meta-tag type">${typesText}</span>` : ''}
            ${skillsText ? `<span class="meta-tag skill">${skillsText}</span>` : ''}
          </div>
        ` : ''}
      </div>
    `;
    
  } catch (error) {
    console.error(`📄 PDF Export: Error processing card ${index}:`, error);
    return `<div class="technique"><p>Ошибка при обработке карточки ${index}: ${error.message}</p></div>`;
  }
}

/**
 * Создает HTML для отдельного приёма
 */
function createTechniqueHTML(card, index) {
  try {
    // Правильно извлекаем данные из карточки с учетом реальной структуры
    const timeMinutes = card.timeMinutes || card.time_minutes || 0;
    
    // Безопасная обработка всех метаданных (все функции возвращают строки)
    const stagesText = (card.stageIds && Array.isArray(card.stageIds)) ? getStageNames(card.stageIds) : '';
    const typesText = (card.typeIds && Array.isArray(card.typeIds)) ? getTypeNames(card.typeIds) : '';
    const skillsText = (card.skillIds && Array.isArray(card.skillIds)) ? getSkillNames(card.skillIds) : '';
    
    // Безопасная обработка ageGroups - getAgeGroupNames возвращает строку, не массив
    let ageGroupsText = '';
    if (card.ageGroups) {
      if (Array.isArray(card.ageGroups)) {
        // Если это массив ID, получаем строку с названиями
        ageGroupsText = getAgeGroupNames(card.ageGroups);
      } else if (typeof card.ageGroups === 'string') {
        // Если это уже строка с названием, используем как есть
        ageGroupsText = card.ageGroups;
      }
    }

    return `
      <div class="technique">
        <div class="technique-header">
          <h3 class="technique-title">${index}. ${card.title || 'Без названия'}</h3>
          <span class="technique-time">${formatTimeDisplay(timeMinutes)}</span>
        </div>
        
        <p class="technique-description">${card.description || 'Описание отсутствует'}</p>
        
        ${card.content ? `
          <div class="technique-content">
            <strong>Содержание:</strong><br>
            ${card.content.replace(/\n/g, '<br>')}
          </div>
        ` : ''}

        <div class="technique-meta">
          ${ageGroupsText ? `<span class="meta-tag age-group">${ageGroupsText}</span>` : ''}
          ${stagesText ? `<span class="meta-tag stage">${stagesText}</span>` : ''}
          ${typesText ? `<span class="meta-tag type">${typesText}</span>` : ''}
          ${skillsText ? `<span class="meta-tag skill">${skillsText}</span>` : ''}
        </div>
      </div>
    `;
    
  } catch (error) {
    console.error(`📄 PDF Export: Error processing card ${index}:`, error);
    return `<div class="technique"><p>Ошибка при обработке карточки ${index}: ${error.message}</p></div>`;
  }
}

/**
 * Экспорт урока в JSON файл
 */
export function exportLessonToJSON(lessonData) {
  const dataStr = JSON.stringify(lessonData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `урок_${lessonData.topic || 'без_названия'}_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Экспорт урока в текстовый файл
 */
export function exportLessonToText(lessonData) {
  const { subject, topic, grade, description, cards, totalTime } = lessonData;
  
  let content = `ПЛАН УРОКА\n`;
  content += `${'='.repeat(50)}\n\n`;
  
  content += `Предмет: ${subject || 'Не указан'}\n`;
  content += `Класс: ${grade || 'Не указан'}\n`;
  content += `Тема: ${topic || 'Не указана'}\n`;
  content += `Общее время: ${totalTime} минут\n`;
  
  if (description) {
    content += `\nОписание: ${description}\n`;
  }
  
  if (cards && cards.length > 0) {
    content += `\nПРИЁМЫ УРОКА (${cards.length})\n`;
    content += `${'-'.repeat(30)}\n\n`;
    
    cards.forEach((card, index) => {
      content += `${index + 1}. ${card.title}\n`;
      content += `   Время: ${formatTimeDisplay(card.timeMinutes)}\n`;
      content += `   Описание: ${card.description}\n`;
      
      if (card.content) {
        content += `   Содержание: ${card.content}\n`;
      }
      
      const stages = card.stageIds ? getStageNames(card.stageIds) : [];
      const types = card.typeIds ? getTypeNames(card.typeIds) : [];
      const skills = card.skills ? getSkillNames(card.skills) : [];
      
      if (stages.length > 0) {
        content += `   Этапы: ${stages.join(', ')}\n`;
      }
      if (types.length > 0) {
        content += `   Типы работы: ${types.join(', ')}\n`;
      }
      if (skills.length > 0) {
        content += `   Навыки: ${skills.join(', ')}\n`;
      }
      
      content += '\n';
    });
    
    content += `\nСВОДКА\n`;
    content += `${'-'.repeat(20)}\n`;
    content += `Количество приёмов: ${cards.length}\n`;
    content += `Общее время: ${totalTime} минут\n`;
    content += `Средняя продолжительность: ${Math.round(totalTime / cards.length)} минут\n`;
  }
  
  const dataBlob = new Blob([content], { type: 'text/plain; charset=utf-8' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `урок_${lessonData.topic || 'без_названия'}_${new Date().toISOString().split('T')[0]}.txt`;
  link.click();
  
  URL.revokeObjectURL(url);
}
