<script>
  import { createEventDispatcher } from 'svelte';
  import { getAgeGroupNames, getSkillNames, getStageNames, getTypeNames } from '$lib/utils/localization.js';
  import { formatTimeDisplay } from '$lib/utils/time-intervals.js';

  const dispatch = createEventDispatcher();

  export let card;
  export let isSelected = false;
  
  // Функции для обработки событий
  function handleAdd() {
    dispatch('add', card);
  }
  
  function handleRemove() {
    dispatch('remove', card.id);
  }

  // Функции для получения отдельных названий
  function getSkillName(skillId) {
    return getSkillNames([skillId]);
  }

  function getStageName(stageId) {
    return getStageNames([stageId]);
  }

  function getTypeName(typeId) {
    return getTypeNames([typeId]);
  }
</script>

<div class="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden {isSelected ? 'ring-2 ring-blue-500 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50' : 'hover:border-gray-300'}">
  <!-- Заголовок и кнопка -->
  <div class="flex items-start justify-between p-4 pb-3">
    <div class="flex-1 min-w-0 pr-3">
      <h3 class="text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors leading-tight">{card.title}</h3>
      
      {#if card.description}
        <p class="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">{card.description}</p>
      {/if}
    </div>
    
    <!-- Кнопка действия -->
    <div class="flex-shrink-0">
      {#if isSelected}
        <button
          on:click={handleRemove}
          class="inline-flex items-center px-3 py-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
        >
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          Удалить
        </button>
      {:else}
        <button
          on:click={handleAdd}
          class="inline-flex items-center px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Добавить
        </button>
      {/if}
    </div>
  </div>
  
  <!-- Метаданные -->
  <div class="px-4 pb-4">
    <!-- Время -->
    <div class="flex items-center mb-3">
      <div class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200">
        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        {formatTimeDisplay(card.timeMinutes || card.time_minutes)}
      </div>
    </div>
    
    <!-- Возрастные группы -->
    {#if card.ageGroups && card.ageGroups.length > 0}
      <div class="flex items-center mb-3">
        <div class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          {getAgeGroupNames(card.ageGroups)}
        </div>
      </div>
    {/if}
    
    <!-- Метаданные -->
    <div class="space-y-2">
      <!-- Навыки -->
      {#if card.skillIds && card.skillIds.length > 0}
        <div class="flex flex-wrap gap-1">
          {#each card.skillIds.slice(0, 3) as skillId}
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
              {getSkillName(skillId)}
            </span>
          {/each}
          {#if card.skillIds.length > 3}
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
              +{card.skillIds.length - 3}
            </span>
          {/if}
        </div>
      {/if}
      
      <!-- Этапы урока -->
      {#if card.stageIds && card.stageIds.length > 0}
        <div class="flex flex-wrap gap-1">
          {#each card.stageIds.slice(0, 3) as stageId}
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200">
              {getStageName(stageId)}
            </span>
          {/each}
          {#if card.stageIds.length > 3}
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
              +{card.stageIds.length - 3}
            </span>
          {/if}
        </div>
      {/if}
      
      <!-- Типы работы -->
      {#if card.typeIds && card.typeIds.length > 0}
        <div class="flex flex-wrap gap-1">
          {#each card.typeIds.slice(0, 3) as typeId}
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border border-purple-200">
              {getTypeName(typeId)}
            </span>
          {/each}
          {#if card.typeIds.length > 3}
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
              +{card.typeIds.length - 3}
            </span>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
