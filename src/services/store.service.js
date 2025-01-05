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
        // 處理圖片URL，使用 image_url 欄位
        const processedContent = response.data.content.map(store => ({
          ...store,
          // 根據 store.id 構建圖片URL
          imageUrl: store.id
              ? `/api/images/${store.id}.jpg`
              : `/api/images/預設商店圖片.jpg`
        }));

        return {
          success: true,
          data: {
            content: processedContent,
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

  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/stores/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
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
      // 如果有圖片檔案，先上傳圖片
      if (storeData.imageFile) {
        const formData = new FormData();
        formData.append('file', storeData.imageFile);

        const imageResponse = await api.post('/stores/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        storeData.imageUrl = imageResponse.data.imageUrl;
      }

      const response = await api.post('/stores', storeData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('創建商店失敗:', error);
      return {
        success: false,
        error: errorHandler(error)
      };
    }
  }

  async updateStore(id, storeData) {
    try {
      // 如果有新的圖片檔案，先上傳圖片
      if (storeData.imageFile) {
        const formData = new FormData();
        formData.append('file', storeData.imageFile);

        const imageResponse = await api.post('/stores/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        storeData.imageUrl = imageResponse.data.imageUrl;
      }

      const response = await api.put(`/stores/${id}`, storeData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('更新商店失敗:', error);
      return {
        success: false,
        error: errorHandler(error)
      };
    }
  }

  async deleteStore(id) {
    try {
      await api.delete(`/stores/${id}`);
      return {
        success: true
      };
    } catch (error) {
      console.error('刪除商店失敗:', error);
      return {
        success: false,
        error: errorHandler(error)
      };
    }
  }
}

export default new StoreService();
