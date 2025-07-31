<script>
  import { createEventDispatcher } from 'svelte';
  import { getAgeGroupNames, getSkillNames, getStageNames, getTypeNames } from '$lib/utils/localization.js';
  import { formatTimeDisplay } from '$lib/utils/time-intervals.js';
  
  const dispatch = createEventDispatcher();
  
  export let card;
  export let index;
  
  function handleRemove() {
    dispatch('remove', card.id);
  }
  
  // Функции для получения названий
  function getAgeGroupNamesForCard(ageGroups) {
    if (!ageGroups || ageGroups.length === 0) return 'Не указано';
    return getAgeGroupNames(ageGroups);
  }
  
  function getSkillNamesForCard(skills) {
    if (!skills || skills.length === 0) return 'Не указано';
    return getSkillNames(skills);
  }
  
  function getStageNamesForCard(stages) {
    if (!stages || stages.length === 0) return 'Не указано';
    return getStageNames(stages);
  }
  
  function getTypeNamesForCard(types) {
    if (!types || types.length === 0) return 'Не указано';
    return getTypeNames(types);
  }
</script>

<div class="card mb-6 animate-slide-up">
  <!-- Заголовок с номером и кнопкой удаления -->
  <div class="flex items-start justify-between mb-4 pb-4 border-b border-secondary-200">
    <div class="flex items-center space-x-4">
      <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
        {index + 1}
      </div>
      <div>
        <h3 class="text-xl font-bold text-secondary-900 mb-1">{card.title}</h3>
        <div class="flex items-center space-x-4 text-sm text-secondary-600">
          <div class="flex items-center">
            <svg class="w-4 h-4 mr-1 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="font-medium">{formatTimeDisplay(card.timeMinutes)}</span>
          </div>
        </div>
      </div>
    </div>
    
    <button
      on:click={handleRemove}
      class="p-2 text-secondary-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
      title="Удалить приём из плана урока"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  </div>
  
  <!-- Описание -->
  {#if card.description}
    <div class="mb-6">
      <h4 class="text-sm font-semibold text-secondary-700 mb-2 uppercase tracking-wide">Описание</h4>
      <p class="text-secondary-700 leading-relaxed">{card.description}</p>
    </div>
  {/if}
  
  <!-- Содержание -->
  {#if card.content}
    <div class="mb-6">
      <h4 class="text-sm font-semibold text-secondary-700 mb-2 uppercase tracking-wide">Содержание</h4>
      <div class="prose prose-sm max-w-none text-secondary-700">
        {@html card.content}
      </div>
    </div>
  {/if}
  
  <!-- Метаданные в сетке -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Возрастные группы -->
    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
      <h4 class="text-sm font-semibold text-blue-800 mb-2 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        Возрастные группы
      </h4>
      <p class="text-blue-700 text-sm">{getAgeGroupNamesForCard(card.ageGroups)}</p>
    </div>
    
    <!-- Навыки -->
    <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
      <h4 class="text-sm font-semibold text-green-800 mb-2 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
        </svg>
        Развиваемые навыки
      </h4>
      <p class="text-green-700 text-sm">{getSkillNamesForCard(card.skills)}</p>
    </div>
    
    <!-- Этапы урока -->
    <div class="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
      <h4 class="text-sm font-semibold text-purple-800 mb-2 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2m-2 0v4a2 2 0 002 2h2a2 2 0 002-2v-4m0 0h2a2 2 0 002-2V7a2 2 0 00-2-2h-2m0 0V3a2 2 0 00-2-2H9a2 2 0 00-2 2v2z"></path>
        </svg>
        Этапы урока
      </h4>
      <p class="text-purple-700 text-sm">{getStageNamesForCard(card.stageIds)}</p>
    </div>
    
    <!-- Типы работы -->
    <div class="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
      <h4 class="text-sm font-semibold text-orange-800 mb-2 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        Типы работы
      </h4>
      <p class="text-orange-700 text-sm">{getTypeNamesForCard(card.typeIds)}</p>
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
