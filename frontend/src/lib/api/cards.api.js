import { BaseApi } from './base.api.js';

export class CardsApi extends BaseApi {
  constructor(customFetch = null) {
    super(customFetch);
  }
  async getAllCards(filters = {}) {
    const params = new URLSearchParams();
    
    // Поиск по тексту
    if (filters.search) {
      params.append('search', filters.search);
    }
    
    // Множественные фильтры возрастных групп
    if (filters.ageGroupIds && filters.ageGroupIds.length > 0) {
      filters.ageGroupIds.forEach(id => {
        params.append('ageGroupIds', id);
      });
    }
    
    // Множественные фильтры навыков
    if (filters.skillIds && filters.skillIds.length > 0) {
      filters.skillIds.forEach(id => {
        params.append('skillIds', id);
      });
    }
    
    // Множественные фильтры этапов урока
    if (filters.stageIds && filters.stageIds.length > 0) {
      filters.stageIds.forEach(id => {
        params.append('stageIds', id);
      });
    }
    
    // Множественные фильтры типов работы
    if (filters.typeIds && filters.typeIds.length > 0) {
      filters.typeIds.forEach(id => {
        params.append('typeIds', id);
      });
    }
    
    // Фильтр времени выполнения
    if (filters.timeRange) {
      params.append('timeRange', filters.timeRange);
    }
    
    // Пагинация
    if (filters.limit) {
      params.append('limit', filters.limit.toString());
    }
    if (filters.offset) {
      params.append('offset', filters.offset.toString());
    }
    
    // Обратная совместимость с одиночными фильтрами
    if (filters.ageGroupId) {
      params.append('ageGroupId', filters.ageGroupId);
    }
    if (filters.skillId) {
      params.append('skillId', filters.skillId);
    }
    if (filters.page) {
      params.append('page', filters.page.toString());
    }
    
    const url = params.toString() ? `/cards?${params.toString()}` : '/cards';
    return this.get(url);
  }

  async getCardById(id) {
    const response = await this.get(`/cards/${id}`);
    return response.data || null;
  }

  async createCard(cardData) {
    return this.post('/cards', cardData);
  }

  async updateCard(id, cardData) {
    return this.put(`/cards/${id}`, cardData);
  }

  async deleteCard(id) {
    return this.delete(`/cards/${id}`);
  }
}

export const cardsApi = new CardsApi();
