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

  async fetchStores(params) {
    try {
      // 調整分頁參數格式以匹配後端 API
      const { page = 0, size = 10, ...restParams } = params;

      console.log('Fetching stores with params:', { page, size, ...restParams });

      const response = await api.get('/stores', {
        params: {
          page,
          size,
          keyword: restParams.keyword || '',
          category: restParams.category || '',
          ...restParams
        }
      });

      // 確保回傳格式符合前端期望
      if (response.status === 200) {
        return {
          success: true,
          data: {
            content: response.data.content || [],
            totalElements: response.data.totalElements || 0,
            totalPages: response.data.totalPages || 0
          }
        };
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Fetch stores error:', error);
      return {
        success: false,
        error: errorHandler(error)
      };
    }
  }

  async getCategories() {
    try {
      const response = await api.get('/stores/categories');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: errorHandler(error)
      };
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

  async createStore(storeData) {
    try {
      const response = await api.post('/stores', storeData);
      return response.data;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async updateStore(id, storeData) {
    try {
      const response = await api.put(`/stores/${id}`, storeData);
      return response.data;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async deleteStore(id) {
    try {
      const response = await api.delete(`/stores/${id}`);
      return response.data;
    } catch (error) {
      throw errorHandler(error);
    }
  }
}

export default new StoreService();
