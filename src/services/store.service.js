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

  async fetchStores(params = {}) {
    try {
      // 移除空值參數
      const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});

      console.log('清理後的請求參數:', cleanParams);

      const response = await api.get('/stores', {
        params: cleanParams
      });

      console.log('原始API回應:', response.data);

      if (response.status === 200) {
        return {
          success: true,
          data: {
            content: response.data.content || [],
            totalElements: response.data.total_elements || 0,
            totalPages: response.data.total_pages || 0
          }
        };
      }

      throw new Error('回應格式錯誤');
    } catch (error) {
      console.error('獲取商店列表失敗:', error);
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
