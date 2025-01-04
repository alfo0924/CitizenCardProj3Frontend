import api from '@/services/api.config';
import { errorHandler } from '@/utils/helpers';

class StoreService {
  // 更新 API path，移除重複的 /api
  async searchStores(params) {
    try {
      const response = await api.get('/stores/search', { params });
      return response.data;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async getStoreDetails(id) {
    try {
      const response = await api.get(`/stores/${id}`);
      return response.data;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async getCategories() {
    try {
      const response = await api.get('/stores/categories');
      return response.data;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async getNearbyStores(params) {
    try {
      const response = await api.get('/stores/nearby', { params });
      return response.data;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async getPopularStores(params) {
    try {
      const response = await api.get('/stores/popular', { params });
      return response.data;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async reportStore(storeId, reportData) {
    try {
      const response = await api.post(`/stores/${storeId}/report`, reportData);
      return response.data;
    } catch (error) {
      throw errorHandler(error);
    }
  }
}

export default new StoreService();
