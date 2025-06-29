import api from "../axios";

export class HouseApi {
  static async getReviews(houseId, {page = '1'}) {
    try {
      return await api.get(`/review/Tenant/house/${houseId}?page=${page}`);
    } catch (e) {
      console.error('Ошибка при загрузке отзывов:', e);
    }
  }

  static async getHouse(houseId) {
    try {
      return await api.get(`/house/${houseId}`);
    } catch (e) {
      console.error('Ошибка при загрузке дома:', e);
      throw e;
    }
  }

  static async getHouses(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      return await api.get(`/house?${query}`);
    } catch (e) {
      console.error('Ошибка при получении домов:', e);
      throw e;
    }
  }

  static async createHouse(formData) {
    return await api.post('/house', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  static async toggleFavorite(houseId) {
    return await api.post(`/house/favorit/${houseId}`);
  }
  
}
