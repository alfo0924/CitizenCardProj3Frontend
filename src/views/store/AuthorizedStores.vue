<template>
  <div class="authorized-stores">
    <!-- 頁面標題區域 -->
    <div class="page-header bg-light py-4">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h2 class="mb-2">特約商店</h2>
            <p class="text-muted mb-0">
              探索城市中的特約商家，享受專屬優惠與服務
            </p>
          </div>
          <div class="col-md-4 text-md-end">
            <div class="btn-group" role="group">
              <button
                  class="btn btn-outline-primary"
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
          </div>
        </div>
      </div>
    </div>

    <!-- 主要內容區域 -->
    <div class="container py-4">
      <!-- 篩選器 -->
      <store-filter
          :categories="categories"
          :areas="areas"
          :enable-distance-filter="showMap"
          @filter-change="handleFilterChange"
      />

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
      <div v-if="!loading && !error" class="mt-4">
        <!-- 列表檢視 -->
        <div v-if="!showMap">
          <store-list
              :stores="filteredStores"
              :loading="loading"
              :current-page="currentPage"
              :total-pages="totalPages"
              @page-change="handlePageChange"
          />
        </div>

        <!-- 地圖檢視 -->
        <div v-else class="map-container">
          <store-map
              :stores="filteredStores"
              :center="mapCenter"
              @marker-click="handleMarkerClick"
              @map-error="handleMapError"
              @location-error="handleLocationError"
          />
        </div>

        <!-- 無結果提示 -->
        <div
            v-if="!loading && filteredStores.length === 0"
            class="text-center py-5"
        >
          <i class="bi bi-search display-1 text-muted"></i>
          <p class="mt-3">沒有找到符合條件的商店</p>
        </div>
      </div>
    </div>

    <!-- 返回頂部按鈕 -->
    <button
        v-show="showBackToTop"
        class="btn btn-primary back-to-top"
        @click="scrollToTop"
    >
      <i class="bi bi-arrow-up"></i>
    </button>
  </div>
</template>

<script>
import StoreFilter from '@/components/store/StoreFilter.vue';
import StoreList from '@/components/store/StoreList.vue';
import StoreMap from '@/components/store/StoreMap.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import AlertMessage from '@/components/common/AlertMessage.vue';

export default {
  name: 'AuthorizedStores',

  components: {
    StoreFilter,
    StoreList,
    StoreMap,
    LoadingSpinner,
    AlertMessage
  },

  data() {
    return {
      stores: [],
      categories: [],
      areas: [],
      loading: false,
      error: '',
      showMap: false,
      currentPage: 1,
      itemsPerPage: 12,
      mapCenter: {
        lat: 25.0330,  // 預設台北市中心
        lng: 121.5654
      },
      showBackToTop: false,
      currentFilters: {
        search: '',
        category: '',
        area: '',
        status: '',
        quickFilters: [],
        sortBy: 'distance',
        distance: 5
      }
    };
  },

  computed: {
    filteredStores() {
      let result = [...this.stores];

      // 關鍵字搜尋
      if (this.currentFilters.search) {
        const searchQuery = this.currentFilters.search.toLowerCase();
        result = result.filter(store =>
            store.name.toLowerCase().includes(searchQuery) ||
            store.address.toLowerCase().includes(searchQuery)
        );
      }

      // 類別篩選
      if (this.currentFilters.category) {
        result = result.filter(store =>
            store.categoryId === this.currentFilters.category
        );
      }

      // 地區篩選
      if (this.currentFilters.area) {
        result = result.filter(store =>
            store.areaId === this.currentFilters.area
        );
      }

      // 營業狀態篩選
      if (this.currentFilters.status) {
        result = result.filter(store =>
            store.status === this.currentFilters.status
        );
      }

      // 快速篩選標籤
      if (this.currentFilters.quickFilters.length > 0) {
        result = result.filter(store =>
            this.currentFilters.quickFilters.every(filter =>
                store.features.includes(filter)
            )
        );
      }

      // 距離篩選（僅在地圖模式下）
      if (this.showMap && this.currentFilters.distance) {
        result = result.filter(store =>
            this.calculateDistance(store) <= this.currentFilters.distance
        );
      }

      // 排序
      result.sort((a, b) => {
        switch (this.currentFilters.sortBy) {
        case 'distance':
          return this.calculateDistance(a) - this.calculateDistance(b);
        case 'rating':
          return b.rating - a.rating;
        case 'popularity':
          return b.favoriteCount - a.favoriteCount;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
        }
      });

      return result;
    },

    totalPages() {
      return Math.ceil(this.filteredStores.length / this.itemsPerPage);
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
        console.error('Error fetching stores:', error);
        this.error = '載入商店資料失敗，請稍後再試';
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

    handleFilterChange(filters) {
      this.currentFilters = { ...filters };
      this.currentPage = 1;
      if (this.showMap) {
        this.updateMapCenter();
      }
    },

    handlePageChange(page) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    handleMarkerClick(storeId) {
      this.$router.push({
        name: 'store-detail',
        params: { id: storeId }
      });
    },

    handleMapError(message) {
      this.error = message;
    },

    handleLocationError(message) {
      this.error = message;
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

    async updateMapCenter() {
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
    },

    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    handleScroll() {
      this.showBackToTop = window.pageYOffset > 300;
    }
  },

  async created() {
    await Promise.all([
      this.fetchStores(),
      this.fetchCategories(),
      this.fetchAreas()
    ]);

    window.addEventListener('scroll', this.handleScroll);
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll);
  },

  watch: {
    showMap(newValue) {
      if (newValue) {
        this.updateMapCenter();
      }
    }
  }
};
</script>

<style scoped>
.authorized-stores {
  min-height: 100vh;
}

.page-header {
  border-bottom: 1px solid #dee2e6;
}

.map-container {
  height: 600px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .page-header {
    text-align: center;
  }

  .page-header .btn-group {
    margin-top: 1rem;
  }

  .map-container {
    height: 400px;
  }
}
</style>
