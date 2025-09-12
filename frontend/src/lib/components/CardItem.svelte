<script>
  import { formatTimeDisplay } from '$lib/utils/time-intervals.js';
  import { getAgeGroupNames, getSkillNames, getStageNames, getTypeNames, getSkillName } from '$lib/utils/localization.js';
  
  export let card;
</script>

<div class="group card card-hover animate-slide-up flex flex-col h-full">
  <!-- Заголовок с временем -->
  <div class="flex justify-between items-start mb-4">
    <h3 class="text-lg font-semibold text-secondary-900 card-title leading-tight">
      {card.title}
    </h3>
    <div class="flex items-center space-x-2 ml-4 flex-shrink-0">
      <div class="badge badge-primary">
        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        {formatTimeDisplay(card.time_minutes)}
      </div>
    </div>
  </div>

  <!-- Описание -->
  <p class="text-secondary-600 mb-6 card-description leading-relaxed">
    {card.description}
  </p>

  <!-- Метаданные -->
  <div class="space-y-3 mb-6 flex-grow">
    {#if card.age_groups?.length > 0}
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"></div>
        <span class="text-xs font-semibold text-secondary-700 uppercase tracking-wide">Возраст:</span>
        <span class="text-sm text-secondary-600 font-medium">
          {getAgeGroupNames(card.age_groups)}
        </span>
      </div>
    {/if}

    {#if card.skills?.length > 0}
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-gradient-to-r from-accent-500 to-primary-500 rounded-full"></div>
        <span class="text-xs font-semibold text-secondary-700 uppercase tracking-wide">Навыки:</span>
        <span class="text-sm text-secondary-600 font-medium">
          {getSkillNames(card.skills)}
        </span>
      </div>
    {/if}

    {#if card.stages?.length > 0}
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-gradient-to-r from-secondary-500 to-accent-500 rounded-full"></div>
        <span class="text-xs font-semibold text-secondary-700 uppercase tracking-wide">Этап урока:</span>
        <span class="text-sm text-secondary-600 font-medium">
          {getStageNames(card.stages)}
        </span>
      </div>
    {/if}

    {#if card.types?.length > 0}
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
        <span class="text-xs font-semibold text-secondary-700 uppercase tracking-wide">Тип работы:</span>
        <span class="text-sm text-secondary-600 font-medium">
          {getTypeNames(card.types)}
        </span>
      </div>
    {/if}
  </div>

  <!-- Нижняя часть с навыками и кнопкой -->
  <div class="flex items-center justify-between mt-auto">
    <!-- Навыки -->
    <div class="flex flex-wrap gap-2">
      {#each (card.skills || []).slice(0, 2) as skill}
        <span class="badge badge-secondary text-xs">
          {getSkillName(skill)}
        </span>
      {/each}
      {#if card.skills?.length > 2}
        <span class="badge badge-accent text-xs">
          +{card.skills.length - 2}
        </span>
      {/if}
    </div>

    <!-- Счетчик просмотров и кнопка подробнее -->
    <div class="flex items-center space-x-3">
      {#if card.views !== undefined}
        <div class="flex items-center text-sm text-secondary-500">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          {card.views}
        </div>
      {/if}
      
      <a 
        href="/{card.id}"
        class="btn btn-primary text-sm px-4 py-2 group-hover:scale-105 transition-transform duration-300"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
        </svg>
        Подробнее
      </a>
    </div>
  </div>
  
  <!-- Градиентная линия внизу -->
  <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
</div>

<style>
  .card-title {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-description {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
