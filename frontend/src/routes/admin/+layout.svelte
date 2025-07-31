<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore } from '$lib/stores/auth.store.js';

  let user = null;
  let isLoading = true;

  onMount(() => {
    // Сначала проверяем сохраненную авторизацию
    authStore.checkSavedAuth();
    
    const unsubscribe = authStore.subscribe(state => {
      user = state.user;
      isLoading = state.isLoading;

      // Проверяем авторизацию и роль админа только после инициализации
      if (!isLoading && (!user || user.role !== 'admin')) {
        goto('/auth/login');
      }
    });

    return unsubscribe;
  });
</script>

{#if isLoading}
  <div class="flex items-center justify-center min-h-screen">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
  </div>
{:else if user && user.role === 'admin'}
  <div class="max-w-7xl mx-auto">
    <!-- Заголовок админ-панели -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Админ-панель</h1>
      <p class="text-gray-600">Управление каталогом педагогических приемов</p>
    </div>



    <!-- Содержимое страницы -->
    <slot />
  </div>
{/if}
