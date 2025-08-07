<script>
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import ConstructorCard from './ConstructorCard.svelte';
  import DetailedLessonCard from './DetailedLessonCard.svelte';
  import { formatTimeDisplay } from '$lib/utils/time-intervals.js';
  import { exportLessonToPDF } from '$lib/utils/pdf-export.js';

  const dispatch = createEventDispatcher();

  // Состояние wizard'а
  let currentStep = 1;
  const totalSteps = 3;

  // Данные урока
  let lessonData = {
    subject: '',
    grade: '',
    topic: '',
    description: '',
    goals: '',
    selectedCards: [],
    totalTime: 0,
    lessonStages: {
      'начало-урока': { cards: [], totalTime: 0 },
      'объяснение-нового-материала': { cards: [], totalTime: 0 },
      'закрепление': { cards: [], totalTime: 0 },
      'конец-урока': { cards: [], totalTime: 0 }
    }
  };

  // Каталог карточек
  export let catalogCards = [];
  export let isLoading = false;

  // Поиск и фильтрация
  let searchQuery = '';
  
  // Текущий выбранный этап урока для добавления карточек
  let currentLessonStage = 'начало-урока';
  
  // Названия этапов урока для отображения
  const lessonStageNames = {
    'начало-урока': 'Начало урока',
    'объяснение-нового-материала': 'Объяснение нового материала',
    'закрепление': 'Закрепление',
    'конец-урока': 'Конец урока'
  };
  let timeFilter = 'all'; // all, short (до 15 мин), medium (15-30 мин), long (30+ мин)
  let selectedAgeGroups = [];
  let selectedSkills = [];
  let selectedStages = [];
  let selectedTypes = [];
  let showFilters = false;
  let filteredCards = [];
  
  // Управление этапами урока на втором шаге
  let showStageCards = {}; // Для отображения карточек каждого этапа
  
  // Предопределенные данные для фильтров (как в каталоге)
  const predefinedAgeGroups = [
    { id: 'начальные-классы', name: 'Начальные классы (1-4)' },
    { id: 'старшие-классы', name: 'Старшие классы (5-11)' }
  ];

  const predefinedSkills = [
    { id: 'критическое-мышление', name: 'Критическое мышление' },
    { id: 'командная-работа', name: 'Командная работа' },
    { id: 'рефлексия', name: 'Рефлексия' },
    { id: 'креативное-мышление', name: 'Креативное мышление' },
    { id: 'систематизация', name: 'Систематизация материала' },
    { id: 'коммуникация', name: 'Коммуникативные навыки' }
  ];

  const predefinedStages = [
    { id: 'начало-урока', name: 'Начало урока' },
    { id: 'объяснение-нового-материала', name: 'Объяснение нового материала' },
    { id: 'закрепление', name: 'Закрепление' },
    { id: 'конец-урока', name: 'Конец урока' }
  ];

  const predefinedTypes = [
    { id: 'индивидуальная', name: 'Индивидуальная работа' },
    { id: 'парная', name: 'Парная работа' },
    { id: 'групповая', name: 'Групповая работа' },
    { id: 'фронтальная', name: 'Фронтальная работа' }
  ];

  // Улучшенная фильтрация карточек с расширенными фильтрами
  $: {
    let filtered = catalogCards;
    
    // Фильтр по поисковому запросу
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(card => 
        card.title?.toLowerCase().includes(query) ||
        card.description?.toLowerCase().includes(query) ||
        card.content?.toLowerCase().includes(query)
      );
    }
    
    // Фильтр по времени
    if (timeFilter !== 'all') {
      filtered = filtered.filter(card => {
        const time = card.timeMinutes || card.time_minutes || 0;
        switch (timeFilter) {
          case 'short': return time <= 15;
          case 'medium': return time > 15 && time <= 30;
          case 'long': return time > 30;
          default: return true;
        }
      });
    }
    
    // Фильтр по возрастным группам
    if (selectedAgeGroups.length > 0) {
      filtered = filtered.filter(card => {
        if (!card.ageGroups || !Array.isArray(card.ageGroups)) return false;
        return selectedAgeGroups.some(selectedId => 
          card.ageGroups.includes(selectedId)
        );
      });
    }
    
    // Фильтр по навыкам
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(card => {
        if (!card.skillIds || !Array.isArray(card.skillIds)) return false;
        return selectedSkills.some(selectedId => 
          card.skillIds.includes(selectedId)
        );
      });
    }
    
    // Фильтр по этапам урока
    if (selectedStages.length > 0) {
      filtered = filtered.filter(card => {
        if (!card.stageIds || !Array.isArray(card.stageIds)) return false;
        return selectedStages.some(selectedId => 
          card.stageIds.includes(selectedId)
        );
      });
    }
    
    // Фильтр по типам работы
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(card => {
        if (!card.typeIds || !Array.isArray(card.typeIds)) return false;
        return selectedTypes.some(selectedId => 
          card.typeIds.includes(selectedId)
        );
      });
    }
    
    filteredCards = filtered;
  }

  // Вычисление общего времени (поддерживаем оба формата)
  $: lessonData.totalTime = lessonData.selectedCards.reduce((sum, card) => {
    const cardTime = card.timeMinutes || card.time_minutes || 0;
    return sum + cardTime;
  }, 0);



  // Навигация по шагам
  function nextStep() {
    // Проверяем валидацию для текущего шага
    if (currentStep === 2 && !step2ButtonEnabled) {
      alert('⚠️ Пожалуйста, выберите хотя бы одну карточку для создания плана урока.');
      return;
    }
    
    if (currentStep < totalSteps) {
      currentStep++;
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }

  function goToStep(step) {
    currentStep = step;
  }

  // Работа с карточками
  function addCard(card) {
    const cardTime = card.timeMinutes || card.time_minutes || 0;
    
    // Проверяем, не добавлена ли уже карточка в текущий этап
    const isAlreadyInCurrentStage = lessonData.lessonStages[currentLessonStage].cards.some(c => c.id === card.id);
    if (isAlreadyInCurrentStage) {
      alert('Эта карточка уже добавлена в данный этап урока');
      return;
    }
    
    // Проверяем общий лимит времени
    if (lessonData.totalTime + cardTime > 45) {
      alert('Превышен лимит времени урока (45 минут)');
      return;
    }
    
    // Добавляем карточку к текущему этапу урока
    lessonData.lessonStages[currentLessonStage].cards = [...lessonData.lessonStages[currentLessonStage].cards, card];
    lessonData.lessonStages[currentLessonStage].totalTime += cardTime;
    
    // Обновляем общие данные (добавляем карточку в общий список, даже если она уже есть в других этапах)
    lessonData.selectedCards = [...lessonData.selectedCards, card];
    lessonData.totalTime += cardTime;
  }

  function removeCard(cardId, stageId = null) {
    // Находим карточку для получения времени
    const cardToRemove = lessonData.selectedCards.find(card => card.id === cardId);
    if (!cardToRemove) return;
    
    const cardTime = cardToRemove.timeMinutes || cardToRemove.time_minutes || 0;
    
    // Если указан этап, удаляем из конкретного этапа
    if (stageId && lessonData.lessonStages[stageId]) {
      lessonData.lessonStages[stageId].cards = lessonData.lessonStages[stageId].cards.filter(card => card.id !== cardId);
      lessonData.lessonStages[stageId].totalTime -= cardTime;
    } else {
      // Иначе ищем во всех этапах
      Object.keys(lessonData.lessonStages).forEach(stage => {
        const cardIndex = lessonData.lessonStages[stage].cards.findIndex(card => card.id === cardId);
        if (cardIndex !== -1) {
          lessonData.lessonStages[stage].cards.splice(cardIndex, 1);
          lessonData.lessonStages[stage].totalTime -= cardTime;
        }
      });
    }
    
    // Обновляем общие данные
    lessonData.selectedCards = lessonData.selectedCards.filter(card => card.id !== cardId);
    lessonData.totalTime -= cardTime;
  }

  // Экспорт PDF
  function handleExportPDF() {
    const exportData = {
      ...lessonData,
      cards: lessonData.selectedCards,
      totalTime: lessonData.totalTime
    };
    
    try {
      exportLessonToPDF(exportData);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Ошибка при экспорте в PDF: ' + error.message);
    }
  }

  // Валидация шагов
  function canProceedFromStep1() {
    return lessonData.subject.trim() && lessonData.grade.trim() && lessonData.topic.trim();
  }

  function canProceedFromStep2() {
    return lessonData.selectedCards.length > 0;
  }

  // Реактивная переменная для состояния кнопки на шаге 2
  $: step2ButtonEnabled = lessonData.selectedCards.length > 0;
  

</script>

<div class="wizard-container">
  <!-- Прогресс-индикатор -->
  <div class="progress-container">
    <div class="progress-steps">
      {#each Array(totalSteps) as _, i}
        <button 
          class="progress-step" 
          class:active={currentStep === i + 1}
          class:completed={currentStep > i + 1}
          on:click={() => goToStep(i + 1)}
          on:keydown={(e) => e.key === 'Enter' && goToStep(i + 1)}
          type="button"
        >
          <div class="step-number">
            {#if currentStep > i + 1}
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            {:else}
              {i + 1}
            {/if}
          </div>
          <div class="step-label">
            {#if i === 0}Информация{:else if i === 1}Приёмы{:else}План урока{/if}
          </div>
        </button>
      {/each}
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: {(currentStep / totalSteps) * 100}%"></div>
    </div>
  </div>

  <!-- Контент шагов -->
  <div class="step-content">
    {#if currentStep === 1}
      <div class="step-container" transition:slide={{ duration: 300, easing: quintOut }}>
        <div class="step-header">
          <h1>📚 Создание урока</h1>
          <p>Расскажите нам о вашем уроке</p>
        </div>

        <div class="form-container">
          <div class="form-group">
            <label for="subject">🎯 Предмет урока</label>
            <input 
              id="subject"
              type="text" 
              bind:value={lessonData.subject}

              placeholder="Например: Математика, История, Биология..."
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="grade">👥 Класс</label>
            <input 
              id="grade"
              type="text" 
              bind:value={lessonData.grade}

              placeholder="Например: 5А, 8-9 классы, 11 класс..."
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="topic">📖 Тема урока</label>
            <input 
              id="topic"
              type="text" 
              bind:value={lessonData.topic}

              placeholder="Например: Решение квадратных уравнений..."
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="goals">🎯 Цели урока</label>
            <textarea 
              id="goals"
              bind:value={lessonData.goals}
              placeholder="Например: развить навыки критического мышления, закрепить знания по теме..."
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="description">📝 Описание урока (необязательно)</label>
            <textarea 
              id="description"
              bind:value={lessonData.description}
              placeholder="Краткое описание хода урока..."
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>
        </div>

        <div class="step-actions">
          <button 
            class="btn btn-primary"
            disabled={false}
            on:click={nextStep}
          >
            Далее: Выбрать приёмы
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>

    {:else if currentStep === 2}
      <div class="step-container" transition:slide={{ duration: 300, easing: quintOut }}>
        <div class="step-header">
          <h1>🎲 Выбор приёмов по этапам урока</h1>
          <p>Добавьте приёмы для каждого этапа урока</p>
          <div class="time-indicator">
            <span class="time-current">{lessonData.totalTime} мин</span>
            <span class="time-separator">/</span>
            <span class="time-limit">45 мин</span>
          </div>
        </div>

        <!-- Навигация по этапам урока -->
        <div class="lesson-stages-nav">
          {#each Object.keys(lessonData.lessonStages) as stageId}
            <button 
              class="stage-nav-btn {currentLessonStage === stageId ? 'active' : ''}"
              on:click={() => currentLessonStage = stageId}
            >
              <span class="stage-name">{lessonStageNames[stageId]}</span>
              <span class="stage-info">
                {lessonData.lessonStages[stageId].cards.length} приёмов, 
                {lessonData.lessonStages[stageId].totalTime} мин
              </span>
            </button>
          {/each}
        </div>

        <!-- Выбранные карточки текущего этапа -->
        {#if lessonData.lessonStages[currentLessonStage].cards.length > 0}
          <div class="selected-stage-cards">
            <h3>Приёмы этапа "{lessonStageNames[currentLessonStage]}":</h3>
            <div class="stage-cards-list">
              {#each lessonData.lessonStages[currentLessonStage].cards as card}
                <div class="stage-card-item">
                  <span class="card-title">{card.title}</span>
                  <span class="card-time">{formatTimeDisplay(card.timeMinutes || card.time_minutes)}</span>
                  <button 
                    class="remove-card-btn"
                    on:click={() => removeCard(card.id, currentLessonStage)}
                    title="Удалить приём"
                  >
                    ✕
                  </button>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <div class="catalog-section">
          <div class="search-container">
            <div class="search-input-wrapper">
              <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input 
                type="text" 
                bind:value={searchQuery}
                placeholder="Поиск приёмов..."
                class="search-input"
              />
              {#if searchQuery}
                <button 
                  class="clear-search-btn"
                  on:click={() => searchQuery = ''}
                  title="Очистить поиск"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              {/if}
            </div>
            
            <!-- Фильтры -->
            <div class="filters-section">
              <div class="filters-header">
                <span class="results-count">Найдено: {filteredCards.length} приёмов</span>
                <button 
                  class="toggle-filters-btn"
                  on:click={() => showFilters = !showFilters}
                >
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"></path>
                  </svg>
                  Фильтры
                  <svg class="w-3 h-3 ml-1 transition-transform {showFilters ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>
              
              {#if showFilters}
                <div class="filters-content" transition:slide={{ duration: 200 }}>
                  <!-- Горизонтальная компоновка фильтров -->
                  <div class="filters-grid">
                    <!-- Фильтр по времени -->
                    <div class="filter-group-horizontal">
                      <span class="filter-label-compact">Время:</span>
                      <div class="filter-buttons-compact">
                        <button class="filter-btn-compact {timeFilter === 'all' ? 'active' : ''}" on:click={() => timeFilter = 'all'}>Все</button>
                        <button class="filter-btn-compact {timeFilter === 'short' ? 'active' : ''}" on:click={() => timeFilter = 'short'}>≤ 15м</button>
                        <button class="filter-btn-compact {timeFilter === 'medium' ? 'active' : ''}" on:click={() => timeFilter = 'medium'}>15-30м</button>
                        <button class="filter-btn-compact {timeFilter === 'long' ? 'active' : ''}" on:click={() => timeFilter = 'long'}>≥ 30м</button>
                      </div>
                    </div>
                    
                    <!-- Фильтр по возрастным группам -->
                    <div class="filter-group-horizontal">
                      <span class="filter-label-compact">Возраст:</span>
                      <div class="filter-checkboxes-horizontal">
                        {#each predefinedAgeGroups as ageGroup}
                          <label class="filter-checkbox-compact">
                            <input type="checkbox" bind:group={selectedAgeGroups} value={ageGroup.id} />
                            <span class="checkmark-compact"></span>
                            <span class="checkbox-text">{ageGroup.name.replace(' классы', '').replace('(', '').replace(')', '')}</span>
                          </label>
                        {/each}
                      </div>
                    </div>
                    
                    <!-- Фильтр по навыкам -->
                    <div class="filter-group-horizontal">
                      <span class="filter-label-compact">Навыки:</span>
                      <div class="filter-checkboxes-horizontal">
                        {#each predefinedSkills as skill}
                          <label class="filter-checkbox-compact">
                            <input type="checkbox" bind:group={selectedSkills} value={skill.id} />
                            <span class="checkmark-compact"></span>
                            <span class="checkbox-text">{skill.name.replace('мышление', 'м-е').replace('работа', 'р-а').replace('навыки', 'н-и')}</span>
                          </label>
                        {/each}
                      </div>
                    </div>
                    
                    <!-- Фильтр по этапам урока -->
                    <div class="filter-group-horizontal">
                      <span class="filter-label-compact">Этапы:</span>
                      <div class="filter-checkboxes-horizontal">
                        {#each predefinedStages as stage}
                          <label class="filter-checkbox-compact">
                            <input type="checkbox" bind:group={selectedStages} value={stage.id} />
                            <span class="checkmark-compact"></span>
                            <span class="checkbox-text">{stage.name.replace('урока', '').replace('материала', 'м-ла').trim()}</span>
                          </label>
                        {/each}
                      </div>
                    </div>
                    
                    <!-- Фильтр по типам работы -->
                    <div class="filter-group-horizontal">
                      <span class="filter-label-compact">Типы:</span>
                      <div class="filter-checkboxes-horizontal">
                        {#each predefinedTypes as type}
                          <label class="filter-checkbox-compact">
                            <input type="checkbox" bind:group={selectedTypes} value={type.id} />
                            <span class="checkmark-compact"></span>
                            <span class="checkbox-text">{type.name.replace('работа', '').trim()}</span>
                          </label>
                        {/each}
                      </div>
                    </div>
                  </div>
                  
                  <!-- Кнопка сброса фильтров -->
                  <div class="filter-actions-horizontal">
                    <button 
                      class="reset-filters-btn-compact"
                      on:click={() => { 
                        searchQuery = ''; 
                        timeFilter = 'all'; 
                        selectedAgeGroups = [];
                        selectedSkills = [];
                        selectedStages = [];
                        selectedTypes = [];
                      }}
                    >
                      Сбросить фильтры
                    </button>
                  </div>
                </div>
              {/if}
            </div>
          </div>

          {#if isLoading}
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Загрузка приёмов...</p>
            </div>
          {:else}
            <div class="cards-grid">
              {#each filteredCards as card (card.id)}
                <ConstructorCard 
                  {card} 
                  isSelected={lessonData.lessonStages[currentLessonStage].cards.some(c => c.id === card.id)}
                  on:add={() => addCard(card)}
                  on:remove={() => removeCard(card.id, currentLessonStage)}
                />
              {/each}
            </div>
          {/if}
        </div>

        <div class="step-actions">
          <button class="btn btn-secondary" on:click={prevStep}>
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Назад
          </button>
          <button 
            class="btn btn-primary"
            disabled={!step2ButtonEnabled}
            on:click={nextStep}
          >
            Создать план урока
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>

    {:else if currentStep === 3}
      <div class="step-container" transition:slide={{ duration: 300, easing: quintOut }}>
        <div class="step-header">
          <h1>🎉 План урока готов!</h1>
          <p>Ваш урок "{lessonData.topic}" создан</p>
        </div>

        <div class="lesson-summary">
          <div class="summary-info">
            <div class="info-item">
              <span class="info-label">Предмет:</span>
              <span class="info-value">{lessonData.subject}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Класс:</span>
              <span class="info-value">{lessonData.grade}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Приёмов:</span>
              <span class="info-value">{lessonData.selectedCards.length}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Время:</span>
              <span class="info-value">{lessonData.totalTime} минут</span>
            </div>
          </div>
        </div>

        <div class="lesson-plan">
          <h3>План урока по этапам:</h3>
          
          {#each Object.keys(lessonData.lessonStages) as stageId}
            {#if lessonData.lessonStages[stageId].cards.length > 0}
              <div class="lesson-stage-section">
                <h4 class="stage-title">
                  {lessonStageNames[stageId]} 
                  <span class="stage-time">({lessonData.lessonStages[stageId].totalTime} мин)</span>
                </h4>
                <div class="lesson-cards">
                  {#each lessonData.lessonStages[stageId].cards as card, index (`${stageId}-${card.id}-${index}`)}
                    <DetailedLessonCard 
                      {card} 
                      index={index + 1}
                      on:remove={() => removeCard(card.id, stageId)}
                    />
                  {/each}
                </div>
              </div>
            {/if}
          {/each}
        </div>

        <div class="step-actions">
          <button class="btn btn-secondary" on:click={prevStep}>
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Изменить приёмы
          </button>
          <button class="btn btn-accent" on:click={handleExportPDF}>
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
            Сохранить в PDF
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .wizard-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
  }

  /* Прогресс-индикатор */
  .progress-container {
    margin-bottom: 3rem;
  }

  .progress-steps {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
    gap: 2rem;
  }

  .progress-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .step-number {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.875rem;
    background: #e5e7eb;
    color: #6b7280;
    transition: all 0.3s ease;
    margin-bottom: 0.5rem;
  }

  .progress-step.active .step-number {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: scale(1.1);
  }

  .progress-step.completed .step-number {
    background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
    color: white;
  }

  .step-label {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
  }

  .progress-step.active .step-label {
    color: #4338ca;
    font-weight: 600;
  }

  .progress-bar {
    height: 4px;
    background: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    transition: width 0.5s ease;
    border-radius: 2px;
  }

  /* Контент шагов */
  .step-container {
    text-align: center;
  }

  .step-header {
    margin-bottom: 2rem;
  }

  .step-header h1 {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .step-header p {
    color: #6b7280;
    font-size: 1.125rem;
  }

  .time-indicator {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-radius: 1rem;
    font-weight: 600;
  }

  .time-current {
    color: #0369a1;
  }

  .time-separator {
    color: #64748b;
  }

  .time-limit {
    color: #64748b;
  }

  /* Формы */
  .form-container {
    max-width: 500px;
    margin: 0 auto;
    text-align: left;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }

  .form-input, .form-textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: white;
  }

  .form-input:focus, .form-textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .form-textarea {
    resize: vertical;
    min-height: 80px;
  }

  /* Навигация по этапам урока */
  .lesson-stages-nav {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
  }

  .stage-nav-btn {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
  }

  .stage-nav-btn:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }

  .stage-nav-btn.active {
    border-color: #667eea;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }

  .stage-name {
    font-weight: 600;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
    line-height: 1.3;
  }

  .stage-info {
    font-size: 0.75rem;
    opacity: 0.8;
    line-height: 1.2;
  }

  /* Выбранные карточки этапа */
  .selected-stage-cards {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #f0f9ff;
    border-radius: 1rem;
    border: 1px solid #0ea5e9;
  }

  .selected-stage-cards h3 {
    margin: 0 0 1rem 0;
    color: #0c4a6e;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .stage-cards-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .stage-card-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    background: white;
    border-radius: 0.5rem;
    border: 1px solid #bae6fd;
  }

  .card-title {
    font-weight: 500;
    color: #0c4a6e;
    flex: 1;
  }

  .card-time {
    font-size: 0.875rem;
    color: #0369a1;
    margin: 0 1rem;
    font-weight: 500;
  }

  .remove-card-btn {
    background: #fee2e2;
    border: 1px solid #fca5a5;
    color: #dc2626;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.75rem;
  }

  .remove-card-btn:hover {
    background: #fecaca;
    border-color: #f87171;
    transform: scale(1.1);
  }

  /* Каталог */
  .catalog-section {
    margin-bottom: 2rem;
  }

  .search-container {
    margin-bottom: 1.5rem;
  }

  .search-input-wrapper {
    position: relative;
    max-width: 400px;
    margin: 0 auto;
  }

  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1.25rem;
    height: 1.25rem;
    color: #9ca3af;
  }

  .search-input {
    width: 100%;
    padding: 0.75rem 3rem 0.75rem 3rem;
    border: 2px solid #e5e7eb;
    border-radius: 2rem;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .clear-search-btn {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: all 0.2s ease;
  }

  .clear-search-btn:hover {
    color: #6b7280;
    background-color: #f3f4f6;
  }

  /* Фильтры */
  .filters-section {
    margin-top: 1rem;
  }

  .filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .results-count {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
  }

  .toggle-filters-btn {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    color: #475569;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .toggle-filters-btn:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  .filters-content {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 1rem;
    margin-top: 0.5rem;
  }



  /* Компактные горизонтальные фильтры */
  .filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.25rem;
    margin-bottom: 1.5rem;
    padding: 1.25rem;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  }

  .filter-group-horizontal {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    padding: 0.75rem;
    background: white;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
  }

  .filter-group-horizontal:hover {
    border-color: #d1d5db;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
  }

  .filter-label-compact {
    font-size: 0.8rem;
    font-weight: 700;
    color: #1e293b;
    text-transform: uppercase;
    letter-spacing: 0.075em;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .filter-label-compact::before {
    content: '';
    width: 3px;
    height: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 2px;
  }

  .filter-buttons-compact {
    display: flex;
    gap: 0.375rem;
    flex-wrap: wrap;
  }

  .filter-btn-compact {
    padding: 0.375rem 0.75rem;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1.5px solid #e2e8f0;
    border-radius: 0.5rem;
    font-size: 0.8rem;
    font-weight: 500;
    color: #475569;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    position: relative;
    overflow: hidden;
  }

  .filter-btn-compact::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.5s;
  }

  .filter-btn-compact:hover {
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    border-color: #cbd5e1;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .filter-btn-compact:hover::before {
    left: 100%;
  }

  .filter-btn-compact.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: #667eea;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .filter-btn-compact.active:hover {
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
  }

  .filter-checkboxes-horizontal {
    display: flex;
    flex-wrap: wrap;
    gap: 0.625rem;
  }

  .filter-checkbox-compact {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 0.8rem;
    color: #475569;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    position: relative;
  }

  .filter-checkbox-compact:hover {
    color: #1e293b;
    background: rgba(102, 126, 234, 0.05);
    transform: translateY(-1px);
  }

  .filter-checkbox-compact input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
  }

  .checkmark-compact {
    position: relative;
    width: 1rem;
    height: 1rem;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border: 1.5px solid #e2e8f0;
    border-radius: 0.375rem;
    margin-right: 0.5rem;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .filter-checkbox-compact:hover .checkmark-compact {
    border-color: #cbd5e1;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .filter-checkbox-compact input[type="checkbox"]:checked + .checkmark-compact {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }

  .filter-checkbox-compact input[type="checkbox"]:checked + .checkmark-compact:after {
    content: '';
    position: absolute;
    left: 0.25rem;
    top: 0.125rem;
    width: 0.25rem;
    height: 0.5rem;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    animation: checkmark-appear 0.2s ease-out;
  }

  @keyframes checkmark-appear {
    0% {
      opacity: 0;
      transform: rotate(45deg) scale(0.5);
    }
    100% {
      opacity: 1;
      transform: rotate(45deg) scale(1);
    }
  }

  .checkbox-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 140px;
    font-weight: 500;
  }

  .filter-actions-horizontal {
    display: flex;
    justify-content: center;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
    margin-top: 0.5rem;
  }

  .reset-filters-btn-compact {
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #fef2f2 0%, #fde8e8 100%);
    border: 1.5px solid #fecaca;
    border-radius: 0.5rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: #dc2626;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(220, 38, 38, 0.1);
  }

  .reset-filters-btn-compact::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }

  .reset-filters-btn-compact:hover {
    background: linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%);
    border-color: #f87171;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(220, 38, 38, 0.2);
  }

  .reset-filters-btn-compact:hover::before {
    left: 100%;
  }

  .reset-filters-btn-compact:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(220, 38, 38, 0.15);
  }

  /* Адаптивность для мобильных устройств */
  @media (max-width: 768px) {
    .filters-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
      padding: 1rem;
      margin-bottom: 1.25rem;
    }
    
    .filter-group-horizontal {
      padding: 0.625rem;
    }
    
    .filter-buttons-compact {
      gap: 0.25rem;
    }
    
    .filter-btn-compact {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
    }
    
    .filter-checkboxes-horizontal {
      gap: 0.5rem;
    }
    
    .filter-checkbox-compact {
      padding: 0.125rem 0.25rem;
      font-size: 0.75rem;
    }
    
    .checkmark-compact {
      width: 0.875rem;
      height: 0.875rem;
      margin-right: 0.375rem;
    }
    
    .checkbox-text {
      max-width: 100px;
    }
    
    .reset-filters-btn-compact {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    .filters-grid {
      padding: 0.75rem;
      gap: 0.75rem;
    }
    
    .filter-group-horizontal {
      padding: 0.5rem;
    }
    
    .filter-label-compact {
      font-size: 0.7rem;
    }
    
    .checkbox-text {
      max-width: 80px;
    }
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }

  .loading-state {
    text-align: center;
    padding: 3rem;
    color: #6b7280;
  }

  .spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid #e5e7eb;
    border-top: 3px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Сводка урока */
  .lesson-summary {
    margin-bottom: 2rem;
  }

  .summary-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    max-width: 600px;
    margin: 0 auto;
    padding: 1.5rem;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .info-label {
    font-weight: 600;
    color: #475569;
  }

  .info-value {
    font-weight: 700;
    color: #1e293b;
  }

  /* План урока */
  .lesson-plan {
    text-align: left;
    margin-bottom: 2rem;
  }

  .lesson-plan h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1rem;
    text-align: center;
  }

  .lesson-stage-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 1rem;
    border: 1px solid #e2e8f0;
  }

  .stage-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .stage-time {
    font-size: 0.9rem;
    font-weight: 500;
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
  }

  .lesson-cards {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* Действия */
  .step-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    border-radius: 0.75rem;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
    text-decoration: none;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 14px 0 rgba(102, 126, 234, 0.3);
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px 0 rgba(102, 126, 234, 0.4);
  }

  .btn-secondary {
    background: #f8fafc;
    color: #475569;
    border: 2px solid #e2e8f0;
  }

  .btn-secondary:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  .btn-accent {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    box-shadow: 0 4px 14px 0 rgba(245, 87, 108, 0.3);
  }

  .btn-accent:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px 0 rgba(245, 87, 108, 0.4);
  }

  /* Адаптивность */
  @media (max-width: 768px) {
    .wizard-container {
      padding: 1rem;
    }

    .progress-steps {
      gap: 1rem;
    }

    .step-header h1 {
      font-size: 1.5rem;
    }

    .cards-grid {
      grid-template-columns: 1fr;
    }

    .step-actions {
      flex-direction: column;
    }

    .summary-info {
      grid-template-columns: 1fr;
    }
  }
</style>
