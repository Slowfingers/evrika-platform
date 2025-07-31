<script>
  import { authStore } from '$lib/stores/auth.store.js';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  async function handleLogin() {
    if (!email || !password) {
      error = 'Введите email и пароль';
      return;
    }

    loading = true;
    error = '';

    try {
      await authStore.login(email, password);
      goto('/');
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Вход - Evrika Platform</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <!-- Логотип и заголовок -->
    <div class="text-center animate-fade-in">
      <div class="mx-auto w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg mb-6">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      </div>
      <h1 class="text-3xl font-bold heading-gradient mb-2">Добро пожаловать!</h1>
      <p class="text-secondary-600">Войдите в свой аккаунт Evrika Platform</p>
    </div>

    <!-- Форма входа -->
    <div class="card animate-slide-up">
      <div class="text-center mb-8">
        <h2 class="text-xl font-semibold text-secondary-900">Вход в систему</h2>
      </div>

    <form on:submit|preventDefault={handleLogin} class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="your@email.com"
          class="input"
          required
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
          Пароль
        </label>
        <input
          id="password"
          type="password"
          bind:value={password}
          placeholder="Введите пароль"
          class="input"
          required
        />
      </div>

      {#if error}
        <div class="bg-red-50 border border-red-200 rounded-lg p-3">
          <p class="text-sm text-red-600">{error}</p>
        </div>
      {/if}

      <button
        type="submit"
        disabled={loading}
        class="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Вход...' : 'Войти'}
      </button>
    </form>

    <div class="mt-6 text-center">
      <p class="text-sm text-gray-600">
        Нет аккаунта?
        <a href="/auth/register" class="text-primary-600 hover:text-primary-700 font-medium">
          Зарегистрироваться
        </a>
      </p>
    </div>


    </div>
  </div>
</div>
