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
        const processedContent = response.data.content.map(store => ({
          ...store,
          // 確保所有需要的欄位都有預設值
          img_url: store.img_url || `/api/images/預設商店圖片.jpg`,
          short_content: store.short_content || '暫無描述',
          priority: store.priority || 0,
          is_donation: Boolean(store.is_donation),
          website: store.website || '',
          time: store.time || '未設定',
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
      // 準備請求數據
      const requestData = {
        name: storeData.name?.trim(),
        area: storeData.area?.trim(), // 確保這個值被正確發送
        tag: storeData.tag?.trim(),
        content: storeData.content?.trim(),
        category: storeData.category?.trim(),
        short_content: storeData.short_content?.trim(),
        time: storeData.time?.trim(),
        address: storeData.address?.trim(),
        phone: storeData.phone?.trim(),
        priority: Number(storeData.priority) || 0,
        website: storeData.website?.trim() || '',
        iframe_src: storeData.iframe_src?.trim(),
        is_donation: Boolean(storeData.is_donation),
        img_url: storeData.img_url?.trim(),
      };

      console.log('發送到後端的數據:', requestData); // 添加日誌

      const response = await api.post('/stores', requestData);

      console.log('後端回應:', response.data); // 添加日誌

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('創建商店失敗:', error);
      console.error('錯誤詳情:', error?.response?.data); // 添加錯誤詳情
      return {
        success: false,
        error: error?.response?.data?.message || '創建商店失敗，請稍後再試'
      };
    }
  }

  async updateStore(id, storeData) {
    try {
      // 準備要更新的資料
      const updateData = {
        name: storeData.name,
        area: storeData.area,
        category: storeData.category,
        tag: storeData.tag,
        content: storeData.content,
        short_content: storeData.short_content,
        time: storeData.time,
        address: storeData.address,
        phone: storeData.phone,
        priority: parseInt(storeData.priority) || 0,
        website: storeData.website || '',
        iframe_src: storeData.iframe_src,
        is_donation: Boolean(storeData.is_donation),
        img_url: storeData.img_url || ''
      };

      // 發送更新請求
      const response = await api.put(`/stores/${id}`, updateData);

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
