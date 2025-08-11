import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      out: 'build',
      precompress: false
    })
  },
  // Исключаем серверные зависимости из клиентского bundle
  vite: {
    define: {
      global: 'globalThis'
    },
    optimizeDeps: {
      exclude: ['sqlite3', 'better-sqlite3', 'pg', 'database']
    },
    ssr: {
      noExternal: []
    }
  }
};

export default config;
