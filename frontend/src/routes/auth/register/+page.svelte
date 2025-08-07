<script>
  import { authStore } from '$lib/stores/auth.store.js';
  import { goto } from '$app/navigation';

  let email = '';
  let name = '';
  let password = '';
  let confirmPassword = '';
  let error = '';
  let loading = false;
  let success = false;

  async function handleRegister() {
    if (!email || !name || !password || !confirmPassword) {
      error = 'Заполните все поля';
      return;
    }

    if (password !== confirmPassword) {
      error = 'Пароли не совпадают';
      return;
    }

    if (password.length < 6) {
      error = 'Пароль должен содержать минимум 6 символов';
      return;
    }

    loading = true;
    error = '';

    try {
      await authStore.register(email, name, password);
      success = true;
      setTimeout(() => {
        goto('/auth/login');
      }, 2000);
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Регистрация - EvrikaEdu Platform</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <!-- Логотип и заголовок -->
    <div class="text-center animate-fade-in">
      <div class="mx-auto w-16 h-16 bg-gradient-to-br from-accent-500 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg mb-6">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
        </svg>
      </div>
      <h1 class="text-3xl font-bold heading-gradient mb-2">Присоединяйтесь!</h1>
      <p class="text-secondary-600">Создайте новый аккаунт EvrikaEdu Platform</p>
    </div>

    <!-- Форма регистрации -->
    <div class="card animate-slide-up">
      <div class="text-center mb-8">
        <h2 class="text-xl font-semibold text-secondary-900">Регистрация</h2>
      </div>

      {#if success}
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
          <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <p class="text-green-800 font-semibold mb-2">Регистрация успешна!</p>
          <p class="text-sm text-green-700">Перенаправляем на страницу входа...</p>
        </div>
      {:else}
        <form on:submit|preventDefault={handleRegister} class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
            Имя
          </label>
          <input
            id="name"
            type="text"
            bind:value={name}
            placeholder="Ваше имя"
            class="input"
            required
          />
        </div>

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
            placeholder="Минимум 6 символов"
            class="input"
            required
          />
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
            Подтвердите пароль
          </label>
          <input
            id="confirmPassword"
            type="password"
            bind:value={confirmPassword}
            placeholder="Повторите пароль"
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
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <!-- Ссылка на вход -->
        <div class="divider"></div>
        <div class="text-center">
          <p class="text-sm text-secondary-600">
            Уже есть аккаунт?
            <a href="/auth/login" class="text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-200">
              Войти
            </a>
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>
