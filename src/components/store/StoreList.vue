<template>
  <div class="store-list-container">
    <!-- 搜尋和篩選區域 -->
    <div class="filter-section mb-4">
      <div class="row g-3">
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-search"></i>
            </span>
            <input
                type="text"
                class="form-control"
                v-model="searchQuery"
                placeholder="搜尋商店名稱或地址"
                @input="handleSearch"
            >
          </div>
        </div>

        <div class="col-md-3">
          <select
              class="form-select"
              v-model="selectedCategory"
              @change="handleFilter"
          >
            <option value="">所有類別</option>
            <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <div class="col-md-3">
          <select
              class="form-select"
              v-model="selectedArea"
              @change="handleFilter"
          >
            <option value="">所有地區</option>
            <option
                v-for="area in areas"
                :key="area.id"
                :value="area.id"
            >
              {{ area.name }}
            </option>
          </select>
        </div>

        <div class="col-md-2">
          <select
              class="form-select"
              v-model="sortBy"
              @change="handleSort"
          >
            <option value="distance">距離最近</option>
            <option value="rating">評分最高</option>
            <option value="popularity">最受歡迎</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 地圖切換按鈕 -->
    <div class="view-toggle mb-3">
      <button
          class="btn btn-outline-primary me-2"
          :class="{ active: !showMap }"
          @click="showMap = false"
      >
        <i class="bi bi-grid"></i> 列表檢視
      </button>
      <button
          class="btn btn-outline-primary"
          :class="{ active: showMap }"
          @click="showMap = true"
      >
        <i class="bi bi-map"></i> 地圖檢視
      </button>
    </div>

    <!-- 載入中提示 -->
    <loading-spinner v-if="loading" />

    <!-- 錯誤提示 -->
    <alert-message
        v-if="error"
        :message="error"
        type="danger"
        @close="error = ''"
    />

    <!-- 商店列表/地圖切換顯示 -->
    <div v-if="!loading && !error">
      <!-- 列表檢視 -->
      <div v-if="!showMap" class="store-grid">
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          <div
              v-for="store in filteredStores"
              :key="store.id"
              class="col"
          >
            <store-card
                :store="store"
                @favorite-changed="handleFavoriteChange"
                @show-error="handleError"
            />
          </div>
        </div>

        <!-- 分頁控制 -->
        <div class="pagination-container mt-4">
          <nav v-if="totalPages > 1">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
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
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
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

      <!-- 地圖檢視 -->
      <div v-else class="map-container">
        <store-map
            :stores="filteredStores"
            :center="mapCenter"
            @marker-click="handleMarkerClick"
        />
      </div>
    </div>

    <!-- 無結果提示 -->
    <div
        v-if="!loading && !error && filteredStores.length === 0"
        class="no-results text-center my-5"
    >
      <i class="bi bi-search display-1 text-muted"></i>
      <p class="mt-3">沒有找到符合條件的商店</p>
    </div>
  </div>
</template>

<script>
import StoreCard from './StoreCard.vue';
import StoreMap from './StoreMap.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import AlertMessage from '@/components/common/AlertMessage.vue';
import { debounce } from '@/utils/helpers';

export default {
  name: 'StoreList',

  components: {
    StoreCard,
    StoreMap,
    LoadingSpinner,
    AlertMessage
  },

  data() {
    return {
      stores: [],
      loading: false,
      error: '',
      searchQuery: '',
      selectedCategory: '',
      selectedArea: '',
      sortBy: 'distance',
      currentPage: 1,
      itemsPerPage: 12,
      showMap: false,
      mapCenter: {
        lat: 25.0330,  // 預設台北市中心
        lng: 121.5654
      },
      categories: [],
      areas: []
    };
  },

  computed: {
    filteredStores() {
      let result = [...this.stores];

      // 搜尋過濾
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(store =>
            store.name.toLowerCase().includes(query) ||
            store.address.toLowerCase().includes(query)
        );
      }

      // 類別過濾
      if (this.selectedCategory) {
        result = result.filter(store =>
            store.categories.some(cat => cat.id === this.selectedCategory)
        );
      }

      // 地區過濾
      if (this.selectedArea) {
        result = result.filter(store => store.areaId === this.selectedArea);
      }

      // 排序
      result.sort((a, b) => {
        switch (this.sortBy) {
        case 'distance':
          return this.calculateDistance(a) - this.calculateDistance(b);
        case 'rating':
          return b.rating - a.rating;
        case 'popularity':
          return b.favoriteCount - a.favoriteCount;
        default:
          return 0;
        }
      });

      return result;
    },

    totalPages() {
      return Math.ceil(this.filteredStores.length / this.itemsPerPage);
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
    },

    paginatedStores() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredStores.slice(start, end);
    }
  },

  methods: {
    async fetchStores() {
      this.loading = true;
      this.error = '';
      try {
        const response = await this.$store.dispatch('store/fetchStores');
        this.stores = response.data;
      } catch (error) {
        this.error = '載入商店資料失敗，請稍後再試';
        console.error('Error fetching stores:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchCategories() {
      try {
        const response = await this.$store.dispatch('store/fetchCategories');
        this.categories = response.data;
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    },

    async fetchAreas() {
      try {
        const response = await this.$store.dispatch('store/fetchAreas');
        this.areas = response.data;
      } catch (error) {
        console.error('Error fetching areas:', error);
      }
    },

    handleSearch: debounce(function() {
      this.currentPage = 1;
    }, 300),

    handleFilter() {
      this.currentPage = 1;
    },

    handleSort() {
      this.currentPage = 1;
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    calculateDistance(store) {
      // 使用 Haversine 公式計算距離
      const R = 6371; // 地球半徑（公里）
      const dLat = this.toRad(store.latitude - this.mapCenter.lat);
      const dLon = this.toRad(store.longitude - this.mapCenter.lng);
      const lat1 = this.toRad(this.mapCenter.lat);
      const lat2 = this.toRad(store.latitude);

      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) *
          Math.cos(lat1) * Math.cos(lat2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    },

    toRad(value) {
      return value * Math.PI / 180;
    },

    handleMarkerClick(storeId) {
      this.$router.push({
        name: 'store-detail',
        params: { id: storeId }
      });
    },

    handleFavoriteChange({ storeId, isFavorite }) {
      const store = this.stores.find(s => s.id === storeId);
      if (store) {
        store.favoriteCount += isFavorite ? 1 : -1;
      }
    },

    handleError(message) {
      this.error = message;
      setTimeout(() => {
        this.error = '';
      }, 3000);
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
        } catch (error) {
          console.error('Error getting current location:', error);
        }
      }
    }
  },

  async created() {
    await Promise.all([
      this.fetchStores(),
      this.fetchCategories(),
      this.fetchAreas(),
      this.getCurrentLocation()
    ]);
  }
};
</script>

<style scoped>
.store-list-container {
  padding: 20px;
}

.filter-section {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.map-container {
  height: 600px;
  border-radius: 8px;
  overflow: hidden;
}

.view-toggle .btn.active {
  background-color: var(--bs-primary);
  color: white;
}

.pagination-container {
  margin-top: 2rem;
}

.no-results {
  color: #6c757d;
}

@media (max-width: 768px) {
  .filter-section .row > div {
    margin-bottom: 1rem;
  }

  .map-container {
    height: 400px;
  }
}
</style>
