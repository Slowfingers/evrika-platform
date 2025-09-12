<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { cardsApi } from '$lib/api/cards.api.js';
  import TimeSelector from '$lib/components/TimeSelector.svelte';

  export let data;
  
  let loading = false;
  let error = '';
  
  // Маппинг английских ID в русские для обратной совместимости
  function mapEnglishToRussianId(englishId, type) {
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
        'motivation': 'мотивация',
        'explanation': 'объяснение',
        'practice': 'практика',
        'reflection': 'рефлексия'
      },
      types: {
        'individual': 'индивидуальная',
        'pair': 'парная',
        'team': 'командная',
        'frontal': 'фронтальная'
      }
    };
    return mappings[type][englishId] || englishId;
  }

  // Преобразование английских ID в русские
  function convertIdsToRussian(ids, type) {
    return ids.map(id => mapEnglishToRussianId(id, type));
  }

  // Обратное преобразование русских ID в английские для backend
  function mapRussianToEnglishId(russianId, type) {
    const reverseMappings = {
      ageGroups: {
        'начальные-классы': 'primary',
        'старшие-классы': 'secondary'
      },
      skills: {
        'критическое-мышление': 'critical',
        'командная-работа': 'teamwork',
        'рефлексия': 'reflection',
        'креативное-мышление': 'creative',
        'систематизация-материала': 'systematization',
        'коммуникация': 'communication'
      },
      stages: {
        'мотивация': 'motivation',
        'объяснение': 'explanation',
        'практика': 'practice',
        'рефлексия': 'reflection'
      },
      types: {
        'индивидуальная': 'individual',
        'парная': 'pair',
        'командная': 'team',
        'фронтальная': 'frontal'
      }
    };
    return reverseMappings[type][russianId] || russianId;
  }

  function convertIdsToEnglish(ids, type) {
    return ids.map(id => mapRussianToEnglishId(id, type));
  }

  // Инициализируем formData данными из карточки
  let formData = {
    title: data.card.title || '',
    description: data.card.description || '',
    content: data.card.content || '',
    time_minutes: data.card.time_minutes || 5,
    age_groups: convertIdsToRussian(data.card.age_groups || [], 'ageGroups'),
    skills: convertIdsToRussian(data.card.skills || [], 'skills'),
    stages: convertIdsToRussian(data.card.stages || [], 'stages'),
    types: convertIdsToRussian(data.card.types || [], 'types')
  };

  // Метаданные
  let ageGroups = [];
  let skills = [];
  let stages = [];
  let types = [];

  // Предопределенные значения
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



  onMount(async () => {
    // Используем предопределенные данные вместо загрузки из API
    ageGroups = predefinedAgeGroups;
    skills = predefinedSkills;
    stages = predefinedStages;
    types = predefinedTypes;
  });

  function toggleSelection(field, value) {
    if (formData[field].includes(value)) {
      formData[field] = formData[field].filter(item => item !== value);
    } else {
      formData[field] = [...formData[field], value];
    }
  }



  async function handleSubmit() {
    if (!formData.title || !formData.description || !formData.content) {
      error = 'Заполните все обязательные поля';
      return;
    }

    loading = true;
    error = '';

    try {
      // Преобразуем русские ID обратно в английские для backend
      const backendData = {
        ...formData,
        age_groups: convertIdsToEnglish(formData.age_groups, 'ageGroups'),
        skills: convertIdsToEnglish(formData.skills, 'skills'),
        stages: convertIdsToEnglish(formData.stages, 'stages'),
        types: convertIdsToEnglish(formData.types, 'types')
      };
      const response = await cardsApi.updateCard(data.card.id, backendData);
      if (response && response.id) {
        alert('Карточка успешно обновлена!');
        await goto('/admin');
      } else {
        error = 'Ошибка обновления карточки';
      }
    } catch (err) {
      error = err.message || 'Ошибка обновления карточки';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Редактировать карточку - Админ-панель</title>
</svelte:head>

<div class="max-w-4xl mx-auto">
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Редактировать карточку</h1>
    <p class="text-gray-600">Изменить данные педагогического приема</p>
  </div>

  {#if error}
    <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-red-600">{error}</p>
    </div>
  {/if}

  <form on:submit|preventDefault={handleSubmit} class="space-y-6">
    <!-- Основная информация -->
    <div class="bg-white p-6 rounded-lg shadow-sm border">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Основная информация</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
            Название приёма *
          </label>
          <input
            type="text"
            id="title"
            bind:value={formData.title}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <TimeSelector 
            selectedMinutes={formData.time_minutes}
            onChange={(minutes) => formData.time_minutes = minutes}
          />
        </div>
      </div>

      <div class="mt-4">
        <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
          Краткое описание *
        </label>
        <textarea
          id="description"
          bind:value={formData.description}
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        ></textarea>
      </div>

      <div class="mt-4">
        <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
          Подробное содержание *
        </label>
        <textarea
          id="content"
          bind:value={formData.content}
          rows="6"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Можно использовать HTML-теги для форматирования"
          required
        ></textarea>
      </div>
    </div>





    <!-- Возрастные группы -->
    <div class="bg-white p-6 rounded-lg shadow-sm border">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Возрастные группы</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        {#each ageGroups as group}
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              class="sr-only peer"
              checked={formData.age_groups.includes(group.id)}
              on:change={() => toggleSelection('age_groups', group.id)}
            />
            <div class="w-4 h-4 border-2 border-gray-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center">
              <svg class="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <span class="text-sm text-gray-700">{group.name}</span>
          </label>
        {/each}
      </div>
    </div>

    <!-- Навыки -->
    <div class="bg-white p-6 rounded-lg shadow-sm border">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Развиваемые навыки</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        {#each skills as skill}
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              class="sr-only peer"
              checked={formData.skills.includes(skill.id)}
              on:change={() => toggleSelection('skills', skill.id)}
            />
            <div class="w-4 h-4 border-2 border-gray-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center">
              <svg class="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <span class="text-sm text-gray-700">{skill.name}</span>
          </label>
        {/each}
      </div>
    </div>

    <!-- Этапы урока -->
    <div class="bg-white p-6 rounded-lg shadow-sm border">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Этапы урока</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        {#each stages as stage}
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              class="sr-only peer"
              checked={formData.stages.includes(stage.id)}
              on:change={() => toggleSelection('stages', stage.id)}
            />
            <div class="w-4 h-4 border-2 border-gray-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center">
              <svg class="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <span class="text-sm text-gray-700">{stage.name}</span>
          </label>
        {/each}
      </div>
    </div>

    <!-- Типы работы -->
    <div class="bg-white p-6 rounded-lg shadow-sm border">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Типы работы</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        {#each types as type}
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              class="sr-only peer"
              checked={formData.types.includes(type.id)}
              on:change={() => toggleSelection('types', type.id)}
            />
            <div class="w-4 h-4 border-2 border-gray-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center">
              <svg class="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <span class="text-sm text-gray-700">{type.name}</span>
          </label>
        {/each}
      </div>
    </div>



    <!-- Кнопки -->
    <div class="flex justify-between items-center pt-6">
      <button
        type="button"
        on:click={() => goto('/admin')}
        class="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
      >
        Отмена
      </button>
      
      <button
        type="submit"
        disabled={loading}
        class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Сохранение...' : 'Сохранить изменения'}
      </button>
    </div>
  </form>
</div>
