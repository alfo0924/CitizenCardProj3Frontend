<template>
  <div class="store-search">
    <!-- 搜尋頁面頂部 -->
    <div class="search-header bg-light py-4">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-8">
            <!-- 主搜尋欄 -->
            <div class="search-bar">
              <div class="input-group input-group-lg">
                <span class="input-group-text bg-white border-end-0">
                  <i class="bi bi-search"></i>
                </span>
                <input
                    type="text"
                    class="form-control border-start-0"
                    v-model="searchQuery"
                    placeholder="搜尋商店名稱、地址或商品..."
                    @input="handleSearch"
                    @keyup.enter="performSearch"
                >
                <button
                    v-if="searchQuery"
                    class="btn btn-outline-secondary border-start-0"
                    type="button"
                    @click="clearSearch"
                >
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>

            <!-- 熱門搜尋標籤 -->
            <div class="popular-searches mt-3" v-if="!searchQuery">
              <small class="text-muted me-2">熱門搜尋：</small>
              <button
                  v-for="tag in popularTags"
                  :key="tag.id"
                  class="btn btn-sm btn-outline-secondary me-2 mb-2"
                  @click="searchByTag(tag)"
              >
                {{ tag.name }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜尋結果區域 -->
    <div class="search-results py-4">
      <div class="container">
        <!-- 篩選器工具列 -->
        <div class="filter-toolbar mb-4">
          <div class="row align-items-center">
            <div class="col-md-6">
              <div class="d-flex align-items-center">
                <span class="results-count me-3" v-if="!loading">
                  找到 {{ totalResults }} 個結果
                </span>
                <div class="view-toggle btn-group">
                  <button
                      class="btn btn-outline-secondary"
                      :class="{ active: viewMode === 'grid' }"
                      @click="viewMode = 'grid'"
                  >
                    <i class="bi bi-grid"></i>
                  </button>
                  <button
                      class="btn btn-outline-secondary"
                      :class="{ active: viewMode === 'list' }"
                      @click="viewMode = 'list'"
                  >
                    <i class="bi bi-list"></i>
                  </button>
                  <button
                      class="btn btn-outline-secondary"
                      :class="{ active: viewMode === 'map' }"
                      @click="viewMode = 'map'"
                  >
                    <i class="bi bi-map"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="d-flex justify-content-md-end">
                <!-- 排序選擇器 -->
                <select
                    class="form-select w-auto"
                    v-model="sortBy"
                    @change="handleSort"
                >
                  <option
                      v-for="option in sortOptions"
                      :key="option.value"
                      :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <!-- 篩選側邊欄 -->
          <div class="col-md-3">
            <div class="filter-sidebar">
              <!-- 類別篩選 -->
              <div class="filter-section mb-4">
                <h5 class="filter-title">商店類別</h5>
                <div class="form-check" v-for="category in categories" :key="category.id">
                  <input
                      class="form-check-input"
                      type="checkbox"
                      :id="'category-' + category.id"
                      :value="category.id"
                      v-model="selectedCategories"
                      @change="handleFilter"
                  >
                  <label class="form-check-label" :for="'category-' + category.id">
                    {{ category.name }}
                    <span class="badge bg-secondary ms-1">{{ category.count }}</span>
                  </label>
                </div>
              </div>

              <!-- 地區篩選 -->
              <div class="filter-section mb-4">
                <h5 class="filter-title">地區</h5>
                <div class="form-check" v-for="area in areas" :key="area.id">
                  <input
                      class="form-check-input"
                      type="checkbox"
                      :id="'area-' + area.id"
                      :value="area.id"
                      v-model="selectedAreas"
                      @change="handleFilter"
                  >
                  <label class="form-check-label" :for="'area-' + area.id">
                    {{ area.name }}
                    <span class="badge bg-secondary ms-1">{{ area.count }}</span>
                  </label>
                </div>
              </div>

              <!-- 其他篩選條件 -->
              <div class="filter-section mb-4">
                <h5 class="filter-title">其他條件</h5>
                <div class="form-check" v-for="feature in features" :key="feature.id">
                  <input
                      class="form-check-input"
                      type="checkbox"
                      :id="'feature-' + feature.id"
                      :value="feature.id"
                      v-model="selectedFeatures"
                      @change="handleFilter"
                  >
                  <label class="form-check-label" :for="'feature-' + feature.id">
                    {{ feature.name }}
                  </label>
                </div>
              </div>

              <!-- 營業狀態篩選 -->
              <div class="filter-section mb-4">
                <h5 class="filter-title">營業狀態</h5>
                <div class="btn-group w-100">
                  <button
                      v-for="status in statusOptions"
                      :key="status.value"
                      class="btn btn-outline-secondary"
                      :class="{ active: selectedStatus === status.value }"
                      @click="setStatus(status.value)"
                  >
                    {{ status.label }}
                  </button>
                </div>
              </div>

              <!-- 距離範圍篩選 -->
              <div class="filter-section mb-4" v-if="viewMode === 'map'">
                <h5 class="filter-title">距離範圍</h5>
                <div class="range-slider">
                  <input
                      type="range"
                      class="form-range"
                      min="0"
                      max="10"
                      step="0.5"
                      v-model.number="distance"
                      @input="handleDistanceChange"
                  >
                  <div class="d-flex justify-content-between">
                    <small>0km</small>
                    <small>{{ distance }}km</small>
                    <small>10km</small>
                  </div>
                </div>
              </div>

              <!-- 清除篩選按鈕 -->
              <button
                  class="btn btn-outline-secondary w-100"
                  @click="clearFilters"
                  :disabled="!hasActiveFilters"
              >
                清除所有篩選
              </button>
            </div>
          </div>

          <!-- 搜尋結果顯示區域 -->
          <div class="col-md-9">
            <!-- 載入中提示 -->
            <loading-spinner v-if="loading" />

            <!-- 錯誤提示 -->
            <alert-message
                v-if="error"
                :message="error"
                type="danger"
                @close="error = ''"
            />

            <!-- 網格檢視 -->
            <div v-if="viewMode === 'grid' && !loading" class="store-grid">
              <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                <div v-for="store in stores" :key="store.id" class="col">
                  <store-card :store="store" />
                </div>
              </div>
            </div>

            <!-- 列表檢視 -->
            <div v-if="viewMode === 'list' && !loading" class="store-list">
              <div v-for="store in stores" :key="store.id" class="mb-3">
                <store-list-item :store="store" />
              </div>
            </div>

            <!-- 地圖檢視 -->
            <div v-if="viewMode === 'map' && !loading" class="store-map">
              <store-map
                  :stores="stores"
                  :center="mapCenter"
                  @marker-click="handleMarkerClick"
              />
            </div>

            <!-- 無結果提示 -->
            <div
                v-if="!loading && !error && stores.length === 0"
                class="no-results text-center py-5"
            >
              <i class="bi bi-search display-1 text-muted"></i>
              <p class="mt-3">沒有找到符合條件的商店</p>
              <button
                  class="btn btn-outline-primary mt-2"
                  @click="clearFilters"
              >
                清除所有篩選條件
              </button>
            </div>

            <!-- 分頁控制 -->
            <div
                v-if="!loading && stores.length > 0 && viewMode !== 'map'"
                class="pagination-container mt-4"
            >
              <nav>
                <ul class="pagination justify-content-center">
                  <li
                      class="page-item"
                      :class="{ disabled: currentPage === 1 }"
                  >
                    <button
                        class="page-link"
                        @click="changePage(currentPage - 1)"
                    >
                      上一頁
                    </button>
                  </li>
                  <li
                      v-for="page in displayedPages"
                      :key="page"
                      class="page-item"
                      :class="{ active: currentPage === page }"
                  >
                    <button
                        class="page-link"
                        @click="changePage(page)"
                    >
                      {{ page }}
                    </button>
                  </li>
                  <li
                      class="page-item"
                      :class="{ disabled: currentPage === totalPages }"
                  >
                    <button
                        class="page-link"
                        @click="changePage(currentPage + 1)"
                    >
                      下一頁
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import StoreCard from '@/components/store/StoreCard.vue';
import StoreListItem from '@/components/store/StoreListItem.vue';
import StoreMap from '@/components/store/StoreMap.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import AlertMessage from '@/components/common/AlertMessage.vue';
import { debounce } from '@/utils/helpers';

export default {
  name: 'StoreSearch',

  components: {
    StoreCard,
    StoreListItem,
    StoreMap,
    LoadingSpinner,
    AlertMessage
  },

  data() {
    return {
      searchQuery: '',
      stores: [],
      loading: false,
      error: '',
      viewMode: 'grid',
      currentPage: 1,
      itemsPerPage: 12,
      totalResults: 0,
      selectedCategories: [],
      selectedAreas: [],
      selectedFeatures: [],
      selectedStatus: '',
      distance: 5,
      sortBy: 'relevance',
      mapCenter: {
        lat: 25.0330,
        lng: 121.5654
      },

      // 固定選項數據
      categories: [],
      areas: [],
      features: [
        { id: 'parking', name: '提供停車' },
        { id: 'wifi', name: '免費WiFi' },
        { id: 'delivery', name: '外送服務' },
        { id: 'discount', name: '優惠中' }
      ],
      statusOptions: [
        { value: '', label: '全部' },
        { value: 'open', label: '營業中' },
        { value: 'closed', label: '已打烊' }
      ],
      sortOptions: [
        { value: 'relevance', label: '相關性' },
        { value: 'distance', label: '距離最近' },
        { value: 'rating', label: '評分最高' },
        { value: 'popularity', label: '最受歡迎' }
      ],
      popularTags: [
        { id: 1, name: '餐廳' },
        { id: 2, name: '咖啡廳' },
        { id: 3, name: '購物中心' },
        { id: 4, name: '電影院' }
      ]
    };
  },

  computed: {
    hasActiveFilters() {
      return (
          this.selectedCategories.length > 0 ||
          this.selectedAreas.length > 0 ||
          this.selectedFeatures.length > 0 ||
          this.selectedStatus !== '' ||
          this.searchQuery !== ''
      );
    },

    totalPages() {
      return Math.ceil(this.totalResults / this.itemsPerPage);
    },

    displayedPages() {
      const delta = 2;
      const range = [];
      for (
          let i = Math.max(1, this.currentPage - delta);
          i <= Math.min(this.totalPages, this.currentPage + delta);
          i++
      ) {
        range.push(i);
      }
      return range;
    }
  },

  methods: {
    async fetchStores() {
      this.loading = true;
      this.error = '';
      try {
        const response = await this.$store.dispatch('store/searchStores', {
          query: this.searchQuery,
          categories: this.selectedCategories,
          areas: this.selectedAreas,
          features: this.selectedFeatures,
          status: this.selectedStatus,
          distance: this.viewMode === 'map' ? this.distance : null,
          sortBy: this.sortBy,
          page: this.currentPage,
          perPage: this.itemsPerPage,
          lat: this.mapCenter.lat,
          lng: this.mapCenter.lng
        });

        this.stores = response.data.stores;
        this.totalResults = response.data.total;
        this.categories = response.data.categories;
        this.areas = response.data.areas;
      } catch (error) {
        console.error('Error fetching stores:', error);
        this.error = '搜尋商店時發生錯誤，請稍後再試';
      } finally {
        this.loading = false;
      }
    },

    handleSearch: debounce(function() {
      this.currentPage = 1;
      this.fetchStores();
    }, 300),

    performSearch() {
      this.fetchStores();
    },

    clearSearch() {
      this.searchQuery = '';
      this.fetchStores();
    },

    searchByTag(tag) {
      this.searchQuery = tag.name;
      this.fetchStores();
    },

    handleFilter() {
      this.currentPage = 1;
      this.fetchStores();
    },

    handleSort() {
      this.currentPage = 1;
      this.fetchStores();
    },

    handleDistanceChange: debounce(function() {
      this.fetchStores();
    }, 300),

    setStatus(status) {
      this.selectedStatus = status;
      this.handleFilter();
    },

    clearFilters() {
      this.selectedCategories = [];
      this.selectedAreas = [];
      this.selectedFeatures = [];
      this.selectedStatus = '';
      this.searchQuery = '';
      this.sortBy = 'relevance';
      this.distance = 5;
      this.currentPage = 1;
      this.fetchStores();
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.fetchStores();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    handleMarkerClick(storeId) {
      this.$router.push({
        name: 'store-detail',
        params: { id: storeId }
      });
    },

    async getCurrentLocation() {
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });

          this.mapCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          if (this.viewMode === 'map') {
            this.fetchStores();
          }
        } catch (error) {
          console.error('Error getting current location:', error);
        }
      }
    }
  },

  watch: {
    viewMode(newMode) {
      if (newMode === 'map') {
        this.getCurrentLocation();
      }
    }
  },

  async created() {
    // 從 URL 參數恢復搜尋狀態
    const query = this.$route.query;
    this.searchQuery = query.q || '';
    this.selectedCategories = query.categories ? query.categories.split(',') : [];
    this.selectedAreas = query.areas ? query.areas.split(',') : [];
    this.currentPage = parseInt(query.page) || 1;
    this.sortBy = query.sort || 'relevance';

    await this.fetchStores();
    this.getCurrentLocation();
  },

  beforeRouteUpdate(to, from, next) {
    // 更新 URL 參數
    const query = {
      q: this.searchQuery || undefined,
      categories: this.selectedCategories.length ? this.selectedCategories.join(',') : undefined,
      areas: this.selectedAreas.length ? this.selectedAreas.join(',') : undefined,
      page: this.currentPage > 1 ? this.currentPage : undefined,
      sort: this.sortBy !== 'relevance' ? this.sortBy : undefined
    };

    this.$router.replace({ query }).catch(() => {});
    next();
  }
};
</script>

<style scoped>
.store-search {
  min-height: 100vh;
}

.search-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.search-bar {
  max-width: 800px;
  margin: 0 auto;
}

.search-bar .input-group {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.popular-searches {
  max-width: 800px;
  margin: 0 auto;
}

.filter-toolbar {
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-sidebar {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #dee2e6;
}

.filter-section {
  margin-bottom: 1.5rem;
}

.filter-section:last-child {
  margin-bottom: 0;
}

.form-check {
  margin-bottom: 0.5rem;
}

.form-check:last-child {
  margin-bottom: 0;
}

.store-map {
  height: 600px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.no-results {
  color: #6c757d;
}

.range-slider {
  padding: 0 0.5rem;
}

@media (max-width: 768px) {
  .filter-toolbar {
    margin-bottom: 1rem;
  }

  .filter-sidebar {
    margin-bottom: 1.5rem;
  }

  .store-map {
    height: 400px;
  }

  .view-toggle {
    margin-top: 1rem;
  }
}
</style>
