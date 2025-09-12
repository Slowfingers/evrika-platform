<script>
  import { onMount } from 'svelte';
  import { formatTimeDisplay } from '$lib/utils/time-intervals.js';
  
  export let data;
  const { card } = data;
  
  // Заголовок страницы
  const title = `${card.title} | EvrikaEdu Platform`;
  
  onMount(() => {
    document.title = title;
  });
  

  
  // Форматирование даты
  function formatDate(dateString) {
    if (!dateString) return 'Дата не указана';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Дата не указана';
      }
      
      return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Ошибка при форматировании даты:', error);
      return 'Дата не указана';
    }
  }

  // Маппинг ID возрастных групп в русские названия
  const ageGroupMapping = {
    // Русские ID
    'начальные-классы': 'Начальные классы (1-4)',
    'старшие-классы': 'Старшие классы (5-11)',
    // Обратная совместимость с английскими ID
    'primary': 'Начальные классы (1-4)',
    'secondary': 'Старшие классы (5-11)',
    'preschool': 'Дошкольники',
    'adult': 'Взрослые'
  };

  // Получение названий возрастных групп
  function getAgeGroupNames(ageGroups) {
    if (!ageGroups || ageGroups.length === 0) return 'Не указано';
    return ageGroups.map(group => {
      // Если group - это объект с полем name, используем его
      if (typeof group === 'object' && group.name) {
        return group.name;
      }
      // Если group - это строка (ID), переводим через маппинг
      return ageGroupMapping[group] || group;
    }).join(', ');
  }

  // Маппинг ID навыков в русские названия
  const skillMapping = {
    // Русские ID
    'критическое-мышление': 'Критическое мышление',
    'командная-работа': 'Командная работа',
    'рефлексия': 'Рефлексия',
    'креативное-мышление': 'Креативное мышление',
    'систематизация': 'Систематизация материала',
    'коммуникация': 'Коммуникативные навыки',
    // Обратная совместимость с английскими ID
    'critical': 'Критическое мышление',
    'teamwork': 'Командная работа',
    'reflection': 'Рефлексия',
    'creative': 'Креативное мышление',
    'systematization': 'Систематизация материала',
    'communication': 'Коммуникативные навыки'
  };

  // Получение названий навыков
  function getSkillNames(skills) {
    if (!skills || skills.length === 0) return 'Не указано';
    return skills.map(skill => {
      // Если skill - это объект с полем name, используем его
      if (typeof skill === 'object' && skill.name) {
        return skill.name;
      }
      // Если skill - это строка (ID), переводим через маппинг
      return skillMapping[skill] || skill;
    }).join(', ');
  }

  // Маппинг ID этапов урока в русские названия
  const stageMapping = {
    // Русские ID
    'начало-урока': 'Начало урока',
    'объяснение-нового-материала': 'Объяснение нового материала',
    'закрепление': 'Закрепление',
    'конец-урока': 'Конец урока',
    // Обратная совместимость со старыми русскими ID
    'мотивация': 'Мотивация',
    'объяснение': 'Объяснение',
    'практика': 'Практика',
    'рефлексия': 'Рефлексия',
    // Обратная совместимость с английскими ID
    'motivation': 'Мотивация',
    'explanation': 'Объяснение',
    'practice': 'Практика',
    'reflection': 'Рефлексия'
  };

  // Получение названий этапов урока
  function getStageNames(stages) {
    if (!stages || stages.length === 0) return 'Не указано';
    return stages.map(stage => {
      // Если stage - это объект с полем name, используем его
      if (typeof stage === 'object' && stage.name) {
        return stage.name;
      }
      // Если stage - это строка (ID), переводим через маппинг
      return stageMapping[stage] || stage;
    }).join(', ');
  }

  // Маппинг ID типов работы в русские названия
  const typeMapping = {
    // Русские ID
    'индивидуальная': 'Индивидуальная',
    'парная': 'Парная',
    'командная': 'Командная',
    'фронтальная': 'Фронтальная',
    // Обратная совместимость с английскими ID
    'individual': 'Индивидуальная',
    'pair': 'Парная',
    'team': 'Командная',
    'frontal': 'Фронтальная'
  };

  // Получение названий типов работы
  function getTypeNames(types) {
    if (!types || types.length === 0) return 'Не указано';
    return types.map(type => {
      // Если type - это объект с полем name, используем его
      if (typeof type === 'object' && type.name) {
        return type.name;
      }
      // Если type - это строка (ID), переводим через маппинг
      return typeMapping[type] || type;
    }).join(', ');
  }
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={card.description} />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
  <div class="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
    <!-- Навигация назад -->
    <div class="mb-4 sm:mb-6 animate-fade-in">
      <a href="/" class="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors duration-200 group text-sm sm:text-base">
        <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Вернуться к каталогу
      </a>
    </div>

    <!-- Основная карточка -->
    <div class="card animate-slide-up">
      <!-- Заголовок и описание -->
      <div class="p-4 sm:p-6 lg:p-8 border-b border-secondary-200 bg-gradient-to-r from-primary-50 to-accent-50">
        <!-- Мобильная версия: заголовок и время в колонку -->
        <div class="block sm:hidden mb-6">
          <h1 class="text-2xl sm:text-3xl font-bold mb-3 heading-gradient">{card.title}</h1>
          <div class="mb-4">
            <div class="badge badge-primary text-sm px-3 py-2 inline-flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {formatTimeDisplay(card.time_minutes)}
            </div>
          </div>
          <p class="text-base text-secondary-700 leading-relaxed">{card.description}</p>
        </div>
        
        <!-- Десктопная версия: заголовок и время в строку -->
        <div class="hidden sm:flex items-start justify-between mb-6">
          <div class="flex-1">
            <h1 class="text-3xl lg:text-4xl font-bold mb-4 heading-gradient">{card.title}</h1>
            <p class="text-lg text-secondary-700 leading-relaxed">{card.description}</p>
          </div>
          <div class="ml-6 flex-shrink-0">
            <div class="badge badge-primary text-lg px-4 py-2">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {formatTimeDisplay(card.time_minutes)}
            </div>
          </div>
        </div>
      </div>

      <!-- Метаданные -->
      <div class="p-4 sm:p-6 lg:p-8 bg-secondary-50 border-b border-secondary-200">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <!-- Возрастные группы -->
          <div class="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-secondary-100">
            <h3 class="font-semibold text-secondary-800 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.196-2.121M9 20H4v-2a3 3 0 015.196-2.121M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              Возрастные группы
            </h3>
            <p class="text-secondary-600 text-sm sm:text-base">{getAgeGroupNames(card.age_groups)}</p>
          </div>

          <!-- Развиваемые навыки -->
          <div class="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-secondary-100">
            <h3 class="font-semibold text-secondary-800 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-accent-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
              Развиваемые навыки
            </h3>
            <p class="text-secondary-600 text-sm sm:text-base">{getSkillNames(card.skills)}</p>
          </div>

          <!-- Этапы урока -->
          <div class="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-secondary-100">
            <h3 class="font-semibold text-secondary-800 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
              Этапы урока
            </h3>
            <p class="text-secondary-600 text-sm sm:text-base">{getStageNames(card.stages)}</p>
          </div>

          <!-- Типы работы -->
          <div class="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-secondary-100">
            <h3 class="font-semibold text-secondary-800 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Типы работы
            </h3>
            <p class="text-secondary-600 text-sm sm:text-base">{getTypeNames(card.types)}</p>
          </div>


        </div>
      </div>
      
      <!-- Основное содержимое приёма -->
      <div class="p-4 sm:p-6 lg:p-8">
        <h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-secondary-900 pb-3 border-b border-secondary-200 flex items-center">
          <svg class="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Содержание приёма
        </h2>
        
        <div class="prose prose-lg max-w-none">
          {#if card.content}
            <!-- Используем dangerouslySetInnerHTML для отображения HTML-содержимого -->
            {@html card.content}
          {:else}
            <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
              <svg class="w-12 h-12 text-amber-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <p class="text-amber-800 font-medium">Содержание приёма пока не добавлено</p>
              <p class="text-amber-600 text-sm mt-2">Администратор может добавить подробное описание через админ-панель</p>
            </div>
          {/if}
        </div>
        
        <!-- Дополнительные материалы -->
        {#if card.file_url}
          <div class="mt-8 pt-8 border-t border-secondary-200">
            <h3 class="text-xl font-bold mb-4 text-secondary-900 pb-2 border-b border-secondary-200 flex items-center">
              <svg class="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Дополнительные материалы
            </h3>
            <a 
              href={card.file_url} 
              download 
              class="btn btn-primary inline-flex items-center"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Скачать материалы
            </a>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  :global(.prose) {
    color: theme('colors.secondary.700');
  }
  
  :global(.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6) {
    color: theme('colors.secondary.900');
  }
  
  :global(.prose a) {
    color: theme('colors.primary.600');
  }
  
  :global(.prose a:hover) {
    color: theme('colors.primary.700');
  }
</style>
