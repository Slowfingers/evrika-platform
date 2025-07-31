import { writable } from 'svelte/store';
import { authApi } from '$lib/api/auth.api.js';

function createAuthStore() {
  const { subscribe, set, update } = writable({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true // Начинаем с состояния загрузки
  });

  return {
    subscribe,
    
    async login(email, password) {
      update(state => ({ ...state, isLoading: true }));
      
      try {
        const response = await authApi.login(email, password);
        
        if (response.success) {
          const { user, token } = response;
          
          // Сохраняем в localStorage
          localStorage.setItem('auth_token', token);
          localStorage.setItem('auth_user', JSON.stringify(user));
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          });
          
          return { success: true, user };
        }
      } catch (error) {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
        
        throw error;
      }
    },

    async register(email, name, password, role = 'user') {
      update(state => ({ ...state, isLoading: true }));
      
      try {
        const response = await authApi.register(email, name, password, role);
        
        if (response.success) {
          update(state => ({ ...state, isLoading: false }));
          return response;
        }
      } catch (error) {
        update(state => ({ ...state, isLoading: false }));
        throw error;
      }
    },

    async logout() {
      try {
        await authApi.logout();
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }
      
      // Очищаем localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });
    },

    checkSavedAuth() {
      // Устанавливаем состояние загрузки
      update(state => ({ ...state, isLoading: true }));
      
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('auth_user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          
          // Проверяем срок действия токена
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (tokenPayload.exp > currentTime) {
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false
            });
          } else {
            // Токен истек
            this.logout();
          }
        } catch (error) {
          console.error('Error parsing saved auth:', error);
          this.logout();
        }
      } else {
        // Нет сохраненных данных авторизации
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    },

    clearAuth() {
      this.logout();
    }
  };
}

export const authStore = createAuthStore();
