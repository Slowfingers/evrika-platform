<script>
  import { onMount } from 'svelte';
  import { cardsApi } from '$lib/api/cards.api.js';
  import { metadataApi } from '$lib/api/metadata.api.js';
  import CardItem from '$lib/components/CardItem.svelte';
  import { convertRussianToEnglishId } from '$lib/utils/localization.js';

  let cards = [];
  let ageGroups = [];
  let skills = [];
  let stages = [];
  let types = [];
  let loading = true;
  let error = null;

  // Фильтры
  let selectedAgeGroups = [];
  let selectedSkills = [];
  let selectedStages = [];
  let selectedTypes = [];
  let selectedTimeRange = '';
  let searchQuery = '';
  
  // Состояние спойлера фильтров для мобильных устройств
  let filtersExpanded = false;

  // Пагинация
  let currentPage = 1;
  let totalCards = 0;
  const cardsPerPage = 12;

  // Предопределенные данные с русскими ID
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
    { id: 'индивидуальная', name: 'Индивидуальная' },
    { id: 'парная', name: 'Парная' },
    { id: 'командная', name: 'Командная' },
    { id: 'фронтальная', name: 'Фронтальная' }
  ];

  const timeRanges = [
    { id: 'up-to-2', name: 'до 2 минут' },
    { id: '3-5', name: '3-5 минут' },
    { id: '5-10', name: '5-10 минут' },
    { id: '15-20', name: '15-20 минут' },
    { id: '25-30', name: '25-30 минут' },
    { id: 'full-lesson', name: 'весь урок' }
  ];

  // Функция convertRussianToEnglishId теперь импортируется из localization.js

  onMount(async () => {
    await loadMetadata();
    await loadCards();
  });

  async function loadMetadata() {
    // Используем предопределенные данные вместо загрузки из API
    ageGroups = predefinedAgeGroups;
    skills = predefinedSkills;
    stages = predefinedStages;
    types = predefinedTypes;

  }

  async function loadCards() {
    loading = true;
    error = null;

    try {
      // Преобразуем русские ID в английские для backend
      const englishAgeGroupIds = selectedAgeGroups && selectedAgeGroups.length > 0 ? selectedAgeGroups.map(id => {
        const englishId = convertRussianToEnglishId(id, 'ageGroups');
        return englishId;
      }) : undefined;
      
      const englishSkillIds = selectedSkills && selectedSkills.length > 0 ? selectedSkills.map(id => {
        const englishId = convertRussianToEnglishId(id, 'skills');
        return englishId;
      }) : undefined;
      
      const englishStageIds = selectedStages && selectedStages.length > 0 ? selectedStages.map(id => {
        const englishId = convertRussianToEnglishId(id, 'stages');
        console.log(`  ${id} → ${englishId}`);
        return englishId;
      }) : undefined;
      
      const englishTypeIds = selectedTypes && selectedTypes.length > 0 ? selectedTypes.map(id => {
        const englishId = convertRussianToEnglishId(id, 'types');
        console.log(`  ${id} → ${englishId}`);
        return englishId;
      }) : undefined;
      
      const filters = {
        ageGroupIds: englishAgeGroupIds && englishAgeGroupIds.length > 0 ? englishAgeGroupIds : undefined,
        skillIds: englishSkillIds && englishSkillIds.length > 0 ? englishSkillIds : undefined,
        stageIds: englishStageIds && englishStageIds.length > 0 ? englishStageIds : undefined,
        typeIds: englishTypeIds && englishTypeIds.length > 0 ? englishTypeIds : undefined,
        timeRange: selectedTimeRange || undefined,
        search: searchQuery || undefined,
        limit: cardsPerPage,
        offset: (currentPage - 1) * cardsPerPage
      };

// Отправляем фильтры на backend
      const response = await cardsApi.getAllCards(filters);

      if (response.success) {
        cards = response.data;
        totalCards = response.total;
      }
    } catch (err) {
      error = err.message;
      console.error('Error loading cards:', err);
    } finally {
      loading = false;
    }
  }

  // Обработчики для поиска и очистки фильтров

  function handleSearch() {
    currentPage = 1;
    loadCards();
  }

  function clearFilters() {
    selectedAgeGroups = [];
    selectedSkills = [];
    selectedStages = [];
    selectedTypes = [];
    selectedTimeRange = '';
    searchQuery = '';
    currentPage = 1;
    loadCards();
  }

  // Реактивность для фильтров
  $: {
    // Проверяем, что есть активные фильтры
    const hasActiveFilters = 
      (selectedAgeGroups && selectedAgeGroups.length > 0) || 
      (selectedSkills && selectedSkills.length > 0) || 
      (selectedStages && selectedStages.length > 0) || 
      (selectedTypes && selectedTypes.length > 0) || 
      selectedTimeRange || 
      searchQuery;
    
// Фильтры изменились, перезагружаем карточки
    
    // Перезагружаем карточки при любом изменении фильтров
    if (ageGroups.length > 0) { // Убеждаемся, что данные загружены
      currentPage = 1;
      loadCards();
    }
  }

  // Пагинация
  $: totalPages = Math.ceil(totalCards / cardsPerPage);

  function goToPage(page) {
    currentPage = page;
    loadCards();
  }
</script>

<svelte:head>
  <title>Каталог педагогических приемов - EvrikaEdu Platform</title>
</svelte:head>

<div class="max-w-7xl mx-auto">
  <!-- Современный заголовок с градиентом -->
  <div class="text-center mb-12 animate-fade-in">
    <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mb-6 shadow-lg">
      <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
      </svg>
    </div>
    <h1 class="text-4xl md:text-5xl font-bold heading-gradient mb-6">
      Каталог педагогических приемов
    </h1>
    <p class="text-xl text-secondary-600 max-w-3xl mx-auto leading-relaxed">
      Откройте для себя эффективные методы обучения и развития навыков учащихся. 
      Современные подходы к образованию в одном месте.
    </p>
  </div>

  <!-- Фильтры -->
  <div class="card mb-8">
    <!-- Поиск - полная ширина сверху -->
    <div class="mb-6">
      <div class="flex w-full">
        <input
          id="search-input"
          type="text"
          bind:value={searchQuery}
          placeholder="Введите название приема для поиска..."
          class="input text-lg py-3 px-4 rounded-r-none flex-1 shadow-sm border-gray-300 focus:border-primary-500 focus:ring-primary-500"
          on:keydown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          on:click={handleSearch}
          class="btn btn-primary rounded-l-none px-6 py-3 text-lg font-medium shadow-sm hover:shadow-md transition-shadow"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          Найти
        </button>
      </div>
    </div>

    <!-- Кнопка показать/скрыть фильтры (только на мобильных) -->
    <div class="block md:hidden mb-4">
      <button
        on:click={() => filtersExpanded = !filtersExpanded}
        class="flex items-center justify-between w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        aria-expanded={filtersExpanded}
      >
        <span class="text-sm font-medium text-gray-700">
          {filtersExpanded ? 'Скрыть фильтры' : 'Показать фильтры'}
        </span>
        <svg 
          class="w-5 h-5 text-gray-500 transition-transform duration-200 {filtersExpanded ? 'rotate-180' : ''}"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
    </div>

    <!-- Остальные фильтры в сетке (скрываемые на мобильных) -->
    <div class="{filtersExpanded ? 'block' : 'hidden'} md:block">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">

      <!-- Возрастные группы -->
      <div>
        <fieldset>
          <legend class="block text-sm font-medium text-gray-700 mb-2">
            Возрастные группы
          </legend>
        <div class="space-y-2">
          {#each ageGroups as group, index}
            <label class="flex items-center">
              <input
                id="age-group-{index}"
                type="checkbox"
                value={group.id}
                checked={selectedAgeGroups.includes(group.id)}
                on:change={(e) => {
                  if (e.target.checked) {
                    selectedAgeGroups = [...selectedAgeGroups, group.id];
                  } else {
                    selectedAgeGroups = selectedAgeGroups.filter(id => id !== group.id);
                  }
                }}
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2 text-sm text-gray-700">{group.name}</span>
            </label>
          {/each}
        </div>
        </fieldset>
      </div>

      <!-- Навыки -->
      <div>
        <fieldset>
          <legend class="block text-sm font-medium text-gray-700 mb-2">
            Развиваемые навыки
          </legend>
        <div class="space-y-2 max-h-32 overflow-y-auto">
          {#each skills as skill}
            <label class="flex items-center">
              <input
                type="checkbox"
                value={skill.id}
                checked={selectedSkills.includes(skill.id)}
                on:change={(e) => {
                  if (e.target.checked) {
                    selectedSkills = [...selectedSkills, skill.id];
                  } else {
                    selectedSkills = selectedSkills.filter(id => id !== skill.id);
                  }
                }}
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2 text-sm text-gray-700">{skill.name}</span>
            </label>
          {/each}
        </div>
        </fieldset>
      </div>

      <!-- Этапы урока -->
      <div>
        <fieldset>
          <legend class="block text-sm font-medium text-gray-700 mb-2">
            Этап урока
          </legend>
        <div class="space-y-2">
          {#each stages as stage}
            <label class="flex items-center">
              <input
                type="checkbox"
                value={stage.id}
                checked={selectedStages.includes(stage.id)}
                on:change={(e) => {
                  if (e.target.checked) {
                    selectedStages = [...selectedStages, stage.id];
                  } else {
                    selectedStages = selectedStages.filter(id => id !== stage.id);
                  }
                }}
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2 text-sm text-gray-700">{stage.name}</span>
            </label>
          {/each}
        </div>
        </fieldset>
      </div>

      <!-- Типы работы -->
      <div>
        <fieldset>
          <legend class="block text-sm font-medium text-gray-700 mb-2">
            Тип работы
          </legend>
        <div class="space-y-2">
          {#each types as type}
            <label class="flex items-center">
              <input
                type="checkbox"
                value={type.id}
                checked={selectedTypes.includes(type.id)}
                on:change={(e) => {
                  if (e.target.checked) {
                    selectedTypes = [...selectedTypes, type.id];
                  } else {
                    selectedTypes = selectedTypes.filter(id => id !== type.id);
                  }
                }}
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2 text-sm text-gray-700">{type.name}</span>
            </label>
          {/each}
        </div>
        </fieldset>
      </div>

      <!-- Время выполнения -->
      <div>
        <label for="time-range" class="block text-sm font-medium text-gray-700 mb-2">
          Время выполнения
        </label>
        <select
          id="time-range"
          value={selectedTimeRange}
          on:change={(e) => {
            selectedTimeRange = e.target.value;
          }}
          class="input"
        >
          <option value="">Все</option>
          {#each timeRanges as range}
            <option value={range.id}>{range.name}</option>
          {/each}
        </select>
      </div>
      </div>

      <!-- Кнопка очистки фильтров -->
      {#if (selectedAgeGroups && selectedAgeGroups.length > 0) || (selectedSkills && selectedSkills.length > 0) || (selectedStages && selectedStages.length > 0) || (selectedTypes && selectedTypes.length > 0) || selectedTimeRange || searchQuery}
        <div class="mt-4 pt-4 border-t border-gray-200">
          <button
            on:click={clearFilters}
            class="btn btn-secondary text-sm"
          >
            Очистить фильтры
          </button>
        </div>
      {/if}
    </div>
  </div>

  <!-- Результаты -->
  <div class="mb-6">
    <p class="text-sm text-gray-600">
      {#if loading}
        Загрузка...
      {:else}
        Найдено {totalCards} приемов
      {/if}
    </p>
  </div>

  <!-- Карточки -->
  {#if loading}
    <div class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      <p class="mt-2 text-gray-600">Загрузка приемов...</p>
    </div>
  {:else if error}
    <div class="text-center py-12">
      <p class="text-red-600 mb-4">Ошибка загрузки: {error}</p>
      <button on:click={loadCards} class="btn btn-primary">
        Попробовать снова
      </button>
    </div>
  {:else if cards.length === 0}
    <div class="text-center py-12">
      <p class="text-gray-600 mb-4">Приемы не найдены</p>
      <button on:click={clearFilters} class="btn btn-secondary">
        Сбросить фильтры
      </button>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {#each cards as card (card.id)}
        <CardItem {card} />
      {/each}
    </div>

    <!-- Пагинация -->
    {#if totalPages > 1}
      <div class="flex justify-center space-x-2">
        <button
          on:click={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          class="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Назад
        </button>

        {#each Array(totalPages) as _, i}
          <button
            on:click={() => goToPage(i + 1)}
            class="btn {currentPage === i + 1 ? 'btn-primary' : 'btn-secondary'}"
          >
            {i + 1}
          </button>
        {/each}

        <button
          on:click={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          class="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Вперед
        </button>
      </div>
    {/if}
  {/if}
</div>
