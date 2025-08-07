<script>
  import { authStore } from '$lib/stores/auth.store.js';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  $: user = $authStore.user;
  $: isAuthenticated = $authStore.isAuthenticated;
  $: currentPath = $page.url.pathname;

  let mobileMenuOpen = false;

  async function handleLogout() {
    await authStore.logout();
    goto('/');
  }

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }
</script>

<header class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-soft">
  <div class="container mx-auto px-6">
    <div class="flex items-center justify-between h-20">
      <!-- Логотип с градиентом -->
      <div class="flex items-center space-x-8">
        <a href="/" class="group flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <span class="text-2xl font-bold heading-gradient">
            EvrikaEdu
          </span>
        </a>
        
        <!-- Навигация -->
        <nav class="hidden lg:flex items-center space-x-2">
          <a 
            href="/" 
            class="nav-link flex items-center {currentPath === '/' ? 'active' : ''}"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            Каталог
          </a>
          <a 
            href="/constructor" 
            class="nav-link flex items-center {currentPath === '/constructor' ? 'active' : ''}"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
            </svg>
            Конструктор
          </a>
          {#if isAuthenticated && user?.role === 'admin'}
            <a 
              href="/admin" 
              class="nav-link flex items-center {currentPath.startsWith('/admin') ? 'active' : ''}"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
              </svg>
              Админ панель
            </a>
          {/if}
        </nav>
      </div>

      <!-- Мобильная кнопка меню -->
      <button 
        on:click={toggleMobileMenu}
        class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Открыть меню"
      >
        <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {#if mobileMenuOpen}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          {/if}
        </svg>
      </button>

      <!-- Пользователь -->
      <div class="hidden lg:flex items-center space-x-4">
        {#if isAuthenticated}
          <div class="flex items-center space-x-4">
            <!-- Аватар и приветствие -->
            <div class="hidden md:flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-medium text-secondary-900">
                  {user?.name}
                </span>
                {#if user?.role === 'admin'}
                  <span class="badge badge-primary text-xs">
                    Администратор
                  </span>
                {/if}
              </div>
            </div>
            
            <!-- Кнопка выхода -->
            <button 
              on:click={handleLogout}
              class="btn btn-secondary text-sm px-4 py-2"
              title="Выйти из аккаунта"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Выйти
            </button>
          </div>
        {:else}
          <div class="flex items-center space-x-3">
            <a href="/auth/login" class="btn btn-secondary text-sm px-4 py-2">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
              </svg>
              Войти
            </a>
            <a href="/auth/register" class="btn btn-primary text-sm px-4 py-2">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
              Регистрация
            </a>
          </div>
        {/if}
      </div>
    </div>
  </div>
  
  <!-- Мобильное меню -->
  {#if mobileMenuOpen}
    <div class="lg:hidden bg-white border-b border-gray-200 shadow-lg">
      <div class="container mx-auto px-6 py-4">
        <!-- Навигационные ссылки -->
        <nav class="space-y-2 mb-4">
          <a 
            href="/" 
            on:click={closeMobileMenu}
            class="mobile-nav-link flex items-center {currentPath === '/' ? 'active' : ''}"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            Каталог
          </a>
          <a 
            href="/constructor" 
            on:click={closeMobileMenu}
            class="mobile-nav-link flex items-center {currentPath === '/constructor' ? 'active' : ''}"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
            </svg>
            Конструктор
          </a>
          {#if isAuthenticated && user?.role === 'admin'}
            <a 
              href="/admin" 
              on:click={closeMobileMenu}
              class="mobile-nav-link flex items-center {currentPath.startsWith('/admin') ? 'active' : ''}"
            >
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
              </svg>
              Админ панель
            </a>
          {/if}
        </nav>
        
        <!-- Пользовательская секция -->
        <div class="border-t border-gray-200 pt-4">
          {#if isAuthenticated}
            <div class="space-y-3">
              <!-- Информация о пользователе -->
              <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div class="w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div class="flex flex-col">
                  <span class="font-medium text-gray-900">
                    {user?.name}
                  </span>
                  {#if user?.role === 'admin'}
                    <span class="text-xs text-primary-600 font-medium">
                      Администратор
                    </span>
                  {/if}
                </div>
              </div>
              
              <!-- Кнопка выхода -->
              <button 
                on:click={() => { handleLogout(); closeMobileMenu(); }}
                class="w-full flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Выйти
              </button>
            </div>
          {:else}
            <div class="space-y-2">
              <a 
                href="/auth/login" 
                on:click={closeMobileMenu}
                class="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
                Войти
              </a>
              <a 
                href="/auth/register" 
                on:click={closeMobileMenu}
                class="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
                Регистрация
              </a>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</header>
