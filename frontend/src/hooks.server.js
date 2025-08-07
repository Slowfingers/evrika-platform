// Глобальная конфигурация для предотвращения CORS проблем
// Отключаем SSR для страниц с API запросами

export async function handle({ event, resolve }) {
  // Отключаем SSR для страниц, которые делают API запросы
  const apiRoutes = [
    '/admin',
    '/constructor', 
    '/catalog'
  ];
  
  const shouldDisableSSR = apiRoutes.some(route => 
    event.url.pathname.startsWith(route)
  );
  
  if (shouldDisableSSR) {
    return await resolve(event, {
      ssr: false
    });
  }
  
  return await resolve(event);
}
