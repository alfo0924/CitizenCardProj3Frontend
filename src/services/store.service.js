import axios from 'axios';
import { errorHandler } from '@/utils/helpers';

const API_URL = process.env.VUE_APP_API_URL + '/api/stores';

class StoreService {
  async searchStores(params) {
    try {
      const response = await axios.get(`${API_URL}/search`, { params });
      return response.data;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async getStoreDetails(id) {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async getCategories() {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      return response.data;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async getNearbyStores(params) {
    try {
      const response = await axios.get(`${API_URL}/nearby`, { params });
      return response.data;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async getPopularStores(params) {
    try {
      const response = await axios.get(`${API_URL}/popular`, { params });
      return response.data;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async reportStore(storeId, reportData) {
    try {
      const response = await axios.post(`${API_URL}/${storeId}/report`, reportData);
      return response.data;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async getStoreStats(storeId) {
    try {
      const response = await axios.get(`${API_URL}/${storeId}/stats`);
      return response.data;
    } catch (error) {
      throw errorHandler(error);
    }
  }

  async updateViewCount(storeId) {
    try {
      const response = await axios.post(`${API_URL}/${storeId}/view`);
      return response.data;
    } catch (error) {
      throw errorHandler(error);
    }
  }
}

export default new StoreService();
