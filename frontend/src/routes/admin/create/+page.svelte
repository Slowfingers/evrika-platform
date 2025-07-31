<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { cardsApi } from '$lib/api/cards.api.js';
  import { metadataApi } from '$lib/api/metadata.api.js';
  import TimeSelector from '$lib/components/TimeSelector.svelte';

  // Данные формы
  let formData = {
    title: '',
    description: '',
    content: '',
    time_minutes: 5,
    age_groups: [],
    skills: [],
    stages: [],
    types: []
  };

  // Метаданные
  let ageGroups = [];
  let skills = [];
  let stages = [];
  let types = [];

  let loading = false;
  let error = '';
  let metadataLoading = true;

  // Предопределенные данные
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

  onMount(async () => {
    await loadMetadata();
  });

  async function loadMetadata() {
    // Используем предопределенные данные вместо загрузки из API
    ageGroups = predefinedAgeGroups;
    skills = predefinedSkills;
    stages = predefinedStages;
    types = predefinedTypes;
    metadataLoading = false;
  }

  function handleCheckboxChange(event, field) {
    const value = event.target.value;
    const checked = event.target.checked;

    if (checked) {
      formData[field] = [...formData[field], value];
    } else {
      formData[field] = formData[field].filter(item => item !== value);
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
      const response = await cardsApi.createCard(formData);
      
      if (response.success) {
        alert('Карточка успешно создана!');
        goto('/admin');
      } else {
        error = 'Ошибка создания карточки';
      }
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Создать карточку - Админ-панель</title>
</svelte:head>

<div class="max-w-4xl mx-auto">
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Создать новую карточку</h1>
    <p class="text-gray-600">Добавьте новый педагогический прием в каталог</p>
  </div>

  {#if metadataLoading}
    <div class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      <p class="mt-2 text-gray-600">Загрузка формы...</p>
    </div>
  {:else}
    <form on:submit|preventDefault={handleSubmit} class="space-y-8">
      <!-- Основная информация -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Основная информация</h2>
        
        <div class="grid grid-cols-1 gap-6">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
              Название приема *
            </label>
            <input
              id="title"
              type="text"
              bind:value={formData.title}
              placeholder="Введите название приема"
              class="input"
              required
            />
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
              Краткое описание *
            </label>
            <textarea
              id="description"
              bind:value={formData.description}
              placeholder="Краткое описание приема (1-2 предложения)"
              rows="3"
              class="input"
              required
            ></textarea>
          </div>

          <div>
            <TimeSelector 
              selectedMinutes={formData.time_minutes}
              onChange={(minutes) => formData.time_minutes = minutes}
            />
          </div>

          <div>
            <label for="content" class="block text-sm font-medium text-gray-700 mb-1">
              Подробное описание *
            </label>
            <textarea
              id="content"
              bind:value={formData.content}
              placeholder="Подробное описание приема, инструкции по применению"
              rows="6"
              class="input"
              required
            ></textarea>
          </div>


        </div>
      </div>





      <!-- Возрастные группы -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Возрастные группы</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each ageGroups as group}
            <label class="flex items-center">
              <input
                type="checkbox"
                value={group.id}
                on:change={(e) => handleCheckboxChange(e, 'age_groups')}
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2 text-sm text-gray-700">{group.name}</span>
            </label>
          {/each}
        </div>
      </div>

      <!-- Развиваемые навыки -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Развиваемые навыки</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each skills as skill}
            <label class="flex items-center">
              <input
                type="checkbox"
                value={skill.id}
                on:change={(e) => handleCheckboxChange(e, 'skills')}
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2 text-sm text-gray-700">{skill.name}</span>
            </label>
          {/each}
        </div>
      </div>

      <!-- Этапы урока -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Этапы урока</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each stages as stage}
            <label class="flex items-center">
              <input
                type="checkbox"
                value={stage.id}
                on:change={(e) => handleCheckboxChange(e, 'stages')}
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2 text-sm text-gray-700">{stage.name}</span>
            </label>
          {/each}
        </div>
      </div>

      <!-- Типы работы -->
      <div class="card">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Типы работы</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each types as type}
            <label class="flex items-center">
              <input
                type="checkbox"
                value={type.id}
                on:change={(e) => handleCheckboxChange(e, 'types')}
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="ml-2 text-sm text-gray-700">{type.name}</span>
            </label>
          {/each}
        </div>
      </div>



      <!-- Ошибка -->
      {#if error}
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-sm text-red-600">{error}</p>
        </div>
      {/if}

      <!-- Кнопки -->
      <div class="flex justify-between">
        <a href="/admin" class="btn btn-secondary">
          Отмена
        </a>
        <button
          type="submit"
          disabled={loading}
          class="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Создание...' : 'Создать карточку'}
        </button>
      </div>
    </form>
  {/if}
</div>
