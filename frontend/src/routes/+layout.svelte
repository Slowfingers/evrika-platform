<script>
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { authStore } from '$lib/stores/auth.store.js';
  import Header from '$lib/components/Header.svelte';

  onMount(() => {
    // Проверяем сохраненную авторизацию
    authStore.checkSavedAuth();
  });
</script>

<div class="min-h-screen bg-gray-50">
  <Header />
  
  <main class="container mx-auto px-4 py-8">
    <slot />
  </main>
</div>
