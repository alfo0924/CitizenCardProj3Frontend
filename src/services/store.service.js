import axios from 'axios';
import { handleError } from '@/utils/helpers';

// API 基礎路徑配置
const API_URL = process.env.VUE_APP_API_URL + '/api/stores';

class StoreService {
  /**
   * 搜尋商店
   * @param {Object} params - 搜尋參數
   * @returns {Promise}
   */
  async searchStores(params) {
    try {
      const response = await axios.get(API_URL + '/search', { params });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * 獲取商店詳情
   * @param {string} id - 商店ID
   * @returns {Promise}
   */
  async getStoreDetails(id) {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * 獲取商店類別列表
   * @returns {Promise}
   */
  async getCategories() {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * 獲取地區列表
   * @returns {Promise}
   */
  async getAreas() {
    try {
      const response = await axios.get(`${API_URL}/areas`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * 獲取商店評價列表
   * @param {string} storeId - 商店ID
   * @param {Object} params - 分頁參數
   * @returns {Promise}
   */
  async getStoreReviews(storeId, params) {
    try {
      const response = await axios.get(`${API_URL}/${storeId}/reviews`, { params });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * 提交商店評價
   * @param {string} storeId - 商店ID
   * @param {Object} reviewData - 評價資料
   * @returns {Promise}
   */
  async submitReview(storeId, reviewData) {
    try {
      const response = await axios.post(`${API_URL}/${storeId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * 收藏/取消收藏商店
   * @param {string} storeId - 商店ID
   * @param {boolean} isFavorite - 是否收藏
   * @returns {Promise}
   */
  async toggleFavorite(storeId, isFavorite) {
    try {
      const response = await axios.post(`${API_URL}/${storeId}/favorite`, {
        isFavorite
      });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * 檢查商店收藏狀態
   * @param {string} storeId - 商店ID
   * @returns {Promise}
   */
  async checkFavoriteStatus(storeId) {
    try {
      const response = await axios.get(`${API_URL}/${storeId}/favorite`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * 獲取用戶收藏的商店列表
   * @param {Object} params - 分頁參數
   * @returns {Promise}
   */
  async getFavoriteStores(params) {
    try {
      const response = await axios.get(`${API_URL}/favorites`, { params });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * 獲取附近的商店
   * @param {Object} params - 位置參數
   * @returns {Promise}
   */
  async getNearbyStores(params) {
    try {
      const response = await axios.get(`${API_URL}/nearby`, { params });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * 獲取熱門商店
   * @param {Object} params - 查詢參數
   * @returns {Promise}
   */
  async getPopularStores(params) {
    try {
      const response = await axios.get(`${API_URL}/popular`, { params });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * 獲取商店優惠券
   * @param {string} storeId - 商店ID
   * @param {Object} params - 查詢參數
   * @returns {Promise}
   */
  async getStoreCoupons(storeId, params) {
    try {
      const response = await axios.get(`${API_URL}/${storeId}/coupons`, { params });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * 領取商店優惠券
   * @param {string} storeId - 商店ID
   * @param {string} couponId - 優惠券ID
   * @returns {Promise}
   */
  async claimCoupon(storeId, couponId) {
    try {
      const response = await axios.post(`${API_URL}/${storeId}/coupons/${couponId}/claim`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * 回報商店資訊錯誤
   * @param {string} storeId - 商店ID
   * @param {Object} reportData - 回報資料
   * @returns {Promise}
   */
  async reportStore(storeId, reportData) {
    try {
      const response = await axios.post(`${API_URL}/${storeId}/report`, reportData);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * 獲取商店營業時間
   * @param {string} storeId - 商店ID
   * @returns {Promise}
   */
  async getBusinessHours(storeId) {
    try {
      const response = await axios.get(`${API_URL}/${storeId}/business-hours`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * 獲取商店圖片
   * @param {string} storeId - 商店ID
   * @param {Object} params - 查詢參數
   * @returns {Promise}
   */
  async getStoreImages(storeId, params) {
    try {
      const response = await axios.get(`${API_URL}/${storeId}/images`, { params });
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * 獲取商店統計資料
   * @param {string} storeId - 商店ID
   * @returns {Promise}
   */
  async getStoreStats(storeId) {
    try {
      const response = await axios.get(`${API_URL}/${storeId}/stats`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }

  /**
   * 更新商店瀏覽次數
   * @param {string} storeId - 商店ID
   * @returns {Promise}
   */
  async updateViewCount(storeId) {
    try {
      const response = await axios.post(`${API_URL}/${storeId}/view`);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  }
}

export default new StoreService();
