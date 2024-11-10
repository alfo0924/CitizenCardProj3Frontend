import storeService from '@/services/store.service';

// 初始狀態
const initialState = {
  stores: [],
  currentStore: null,
  categories: [],
  areas: [],
  totalResults: 0,
  loading: false,
  error: null,
  favorites: [],
  searchParams: {
    query: '',
    categories: [],
    areas: [],
    features: [],
    status: '',
    sortBy: 'relevance',
    page: 1,
    perPage: 12
  }
};

// 狀態
const state = {
  ...initialState
};

// getter
const getters = {
  // 獲取所有商店
  getAllStores: state => state.stores,

  // 獲取當前商店
  getCurrentStore: state => state.currentStore,

  // 獲取所有類別
  getCategories: state => state.categories,

  // 獲取所有地區
  getAreas: state => state.areas,

  // 獲取總結果數
  getTotalResults: state => state.totalResults,

  // 獲取載入狀態
  isLoading: state => state.loading,

  // 獲取錯誤信息
  getError: state => state.error,

  // 獲取收藏商店列表
  getFavorites: state => state.favorites,

  // 獲取搜尋參數
  getSearchParams: state => state.searchParams,

  // 檢查商店是否已收藏
  isFavorite: state => storeId => state.favorites.includes(storeId)
};

// mutations
const mutations = {
  // 設置商店列表
  SET_STORES(state, stores) {
    state.stores = stores;
  },

  // 設置當前商店
  SET_CURRENT_STORE(state, store) {
    state.currentStore = store;
  },

  // 設置類別列表
  SET_CATEGORIES(state, categories) {
    state.categories = categories;
  },

  // 設置地區列表
  SET_AREAS(state, areas) {
    state.areas = areas;
  },

  // 設置總結果數
  SET_TOTAL_RESULTS(state, total) {
    state.totalResults = total;
  },

  // 設置載入狀態
  SET_LOADING(state, status) {
    state.loading = status;
  },

  // 設置錯誤信息
  SET_ERROR(state, error) {
    state.error = error;
  },

  // 設置收藏商店列表
  SET_FAVORITES(state, favorites) {
    state.favorites = favorites;
  },

  // 新增收藏商店
  ADD_FAVORITE(state, storeId) {
    if (!state.favorites.includes(storeId)) {
      state.favorites.push(storeId);
    }
  },

  // 移除收藏商店
  REMOVE_FAVORITE(state, storeId) {
    const index = state.favorites.indexOf(storeId);
    if (index > -1) {
      state.favorites.splice(index, 1);
    }
  },

  // 設置搜尋參數
  SET_SEARCH_PARAMS(state, params) {
    state.searchParams = { ...state.searchParams, ...params };
  },

  // 重置狀態
  RESET_STATE(state) {
    Object.assign(state, initialState);
  },

  // 更新商店評價
  UPDATE_STORE_REVIEW(state, { storeId, review }) {
    if (state.currentStore && state.currentStore.id === storeId) {
      state.currentStore.reviews.unshift(review);
      state.currentStore.rating = review.newAverageRating;
      state.currentStore.reviewCount++;
    }
  },

  // 更新商店資訊
  UPDATE_STORE_INFO(state, { storeId, updates }) {
    if (state.currentStore && state.currentStore.id === storeId) {
      state.currentStore = { ...state.currentStore, ...updates };
    }

    const storeIndex = state.stores.findIndex(store => store.id === storeId);
    if (storeIndex > -1) {
      state.stores[storeIndex] = { ...state.stores[storeIndex], ...updates };
    }
  }
};

// actions
const actions = {
  // 搜尋商店
  async searchStores({ commit }, params) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const response = await storeService.searchStores(params);
      commit('SET_STORES', response.data.stores);
      commit('SET_TOTAL_RESULTS', response.data.total);
      commit('SET_SEARCH_PARAMS', params);
      return response;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // 獲取商店詳情
  async fetchStoreDetails({ commit }, storeId) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      const response = await storeService.getStoreDetails(storeId);
      commit('SET_CURRENT_STORE', response.data);
      return response;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  // 獲取類別列表
  async fetchCategories({ commit }) {
    try {
      const response = await storeService.getCategories();
      commit('SET_CATEGORIES', response.data);
      return response;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    }
  },

  // 獲取地區列表
  async fetchAreas({ commit }) {
    try {
      const response = await storeService.getAreas();
      commit('SET_AREAS', response.data);
      return response;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    }
  },

  // 獲取商店評價
  async fetchStoreReviews({ commit }, { storeId, params }) {
    try {
      const response = await storeService.getStoreReviews(storeId, params);
      return response;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    }
  },

  // 提交評價
  async submitReview({ commit }, { storeId, reviewData }) {
    try {
      const response = await storeService.submitReview(storeId, reviewData);
      commit('UPDATE_STORE_REVIEW', {
        storeId,
        review: response.data
      });
      return response;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    }
  },

  // 切換收藏狀態
  async toggleFavorite({ commit }, { storeId, isFavorite }) {
    try {
      await storeService.toggleFavorite(storeId, isFavorite);
      if (isFavorite) {
        commit('ADD_FAVORITE', storeId);
      } else {
        commit('REMOVE_FAVORITE', storeId);
      }
      commit('UPDATE_STORE_INFO', {
        storeId,
        updates: { favoriteCount: isFavorite ? 1 : -1 }
      });
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    }
  },

  // 檢查收藏狀態
  async checkFavoriteStatus({ commit }, storeId) {
    try {
      const response = await storeService.checkFavoriteStatus(storeId);
      if (response.data.isFavorite) {
        commit('ADD_FAVORITE', storeId);
      }
      return response;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    }
  },

  // 獲取收藏的商店
  async fetchFavoriteStores({ commit }, params) {
    try {
      const response = await storeService.getFavoriteStores(params);
      commit('SET_FAVORITES', response.data.stores.map(store => store.id));
      return response;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    }
  },

  // 獲取附近商店
  async fetchNearbyStores({ commit }, params) {
    try {
      const response = await storeService.getNearbyStores(params);
      return response;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    }
  },

  // 回報商店資訊
  async reportStore({ commit }, { storeId, reportData }) {
    try {
      const response = await storeService.reportStore(storeId, reportData);
      return response;
    } catch (error) {
      commit('SET_ERROR', error.message);
      throw error;
    }
  },

  // 重置商店狀態
  resetStoreState({ commit }) {
    commit('RESET_STATE');
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
