<script>
  import { onMount } from 'svelte';
  import { cardsApi } from '$lib/api/cards.api.js';
  import { goto } from '$app/navigation';
  import { formatTimeDisplay } from '$lib/utils/time-intervals.js';

  let cards = [];
  let loading = true;
  let error = null;
  let totalCards = 0;

  // Пагинация
  let currentPage = 1;
  const cardsPerPage = 10;

  onMount(() => {
    loadCards();
  });

  async function loadCards() {
    loading = true;
    error = null;

    try {
      const response = await cardsApi.getAllCards({
        limit: cardsPerPage,
        offset: (currentPage - 1) * cardsPerPage
      });

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

  async function deleteCard(cardId, cardTitle) {
    if (!confirm(`Удалить карточку "${cardTitle}"?`)) {
      return;
    }

    try {
      await cardsApi.deleteCard(cardId);
      await loadCards(); // Перезагружаем список
      alert('Карточка успешно удалена');
    } catch (err) {
      alert(`Ошибка удаления: ${err.message}`);
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
  <title>Админ-панель - Evrika Platform</title>
</svelte:head>

<div class="space-y-6">
  <!-- Статистика -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="card">
      <div class="flex items-center">
        <div class="p-2 bg-primary-100 rounded-lg">
          <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600">Всего карточек</p>
          <p class="text-2xl font-bold text-gray-900">{totalCards}</p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="flex items-center">
        <div class="p-2 bg-green-100 rounded-lg">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600">Действия</p>
          <a href="/admin/create" class="text-sm font-medium text-green-600 hover:text-green-700">
            Создать карточку
          </a>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="flex items-center">
        <div class="p-2 bg-blue-100 rounded-lg">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-600">Каталог</p>
          <a href="/" class="text-sm font-medium text-blue-600 hover:text-blue-700">
            Посмотреть каталог
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- Список карточек -->
  <div class="card">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-gray-900">Управление карточками</h2>
      <a href="/admin/create" class="btn btn-primary hidden md:flex">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Создать карточку
      </a>
    </div>

    {#if loading}
      <div class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="mt-2 text-gray-600">Загрузка карточек...</p>
      </div>
    {:else if error}
      <div class="text-center py-8">
        <p class="text-red-600 mb-4">Ошибка загрузки: {error}</p>
        <button on:click={loadCards} class="btn btn-primary">
          Попробовать снова
        </button>
      </div>
    {:else if cards.length === 0}
      <div class="text-center py-8">
        <p class="text-gray-600 mb-4">Карточки не найдены</p>
        <a href="/admin/create" class="btn btn-primary">
          Создать первую карточку
        </a>
      </div>
    {:else}
      <!-- Таблица карточек -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Название
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Время
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Возраст
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Создано
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each cards as card (card.id)}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div>
                    <div class="text-sm font-medium text-gray-900 line-clamp-1">
                      {card.title}
                    </div>
                    <div class="text-sm text-gray-500 line-clamp-2">
                      {card.description}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-900">
                    {formatTimeDisplay(card.time_minutes)}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-wrap gap-1">
                    {#each card.age_groups?.slice(0, 2) || [] as ageGroup}
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {ageGroup}
                      </span>
                    {/each}
                    {#if card.age_groups?.length > 2}
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        +{card.age_groups.length - 2}
                      </span>
                    {/if}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(card.created_at).toLocaleDateString('ru-RU')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end space-x-2">
                    <button
                      on:click={() => goto(`/admin/${card.id}/edit`)}
                      class="text-primary-600 hover:text-primary-900"
                    >
                      Редактировать
                    </button>
                    <button
                      on:click={() => deleteCard(card.id, card.title)}
                      class="text-red-600 hover:text-red-900"
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Пагинация -->
      {#if totalPages > 1}
        <div class="flex justify-center space-x-2 mt-6 pt-6 border-t border-gray-200">
          <button
            on:click={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            class="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Назад
          </button>

          {#each Array(Math.min(totalPages, 5)) as _, i}
            {@const page = i + 1}
            <button
              on:click={() => goToPage(page)}
              class="btn {currentPage === page ? 'btn-primary' : 'btn-secondary'}"
            >
              {page}
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
</div>

<style>
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
