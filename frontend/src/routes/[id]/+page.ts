import { CardsApi } from '$lib/api/cards.api.js';
import { error } from '@sveltejs/kit';

export async function load({ params, fetch }) {
  try {
    const cardsApi = new CardsApi(fetch);
    const card = await cardsApi.getCardById(params.id);
    
    if (!card) {
      throw error(404, 'Карточка не найдена');
    }
    
    return {
      card
    };
  } catch (err) {
    console.error('Ошибка загрузки карточки:', err);
    throw error(404, 'Карточка не найдена');
  }
}
