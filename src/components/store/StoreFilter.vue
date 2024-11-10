<template>
  <div class="store-filter">
    <!-- 篩選器主容器 -->
    <div class="filter-container">
      <!-- 搜尋欄位 -->
      <div class="search-section mb-3">
        <div class="input-group">
          <span class="input-group-text bg-white">
            <i class="bi bi-search"></i>
          </span>
          <input
              type="text"
              class="form-control"
              v-model="searchQuery"
              placeholder="搜尋商店名稱或地址"
              @input="handleSearch"
          >
          <button
              v-if="searchQuery"
              class="btn btn-outline-secondary"
              type="button"
              @click="clearSearch"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      <!-- 快速篩選標籤 -->
      <div class="quick-filters mb-3">
        <div class="d-flex flex-wrap gap-2">
          <button
              v-for="tag in quickFilterTags"
              :key="tag.id"
              class="btn btn-outline-primary btn-sm"
              :class="{ active: selectedQuickFilters.includes(tag.id) }"
              @click="toggleQuickFilter(tag.id)"
          >
            <i :class="tag.icon"></i>
            {{ tag.name }}
          </button>
        </div>
      </div>

      <!-- 進階篩選選項 -->
      <div class="advanced-filters">
        <div class="row g-3">
          <!-- 商店類別 -->
          <div class="col-md-6">
            <label class="form-label">商店類別</label>
            <select
                class="form-select"
                v-model="selectedCategory"
                @change="handleFilter"
            >
              <option value="">全部類別</option>
              <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- 地區選擇 -->
          <div class="col-md-6">
            <label class="form-label">地區</label>
            <select
                class="form-select"
                v-model="selectedArea"
                @change="handleFilter"
            >
              <option value="">全部地區</option>
              <option
                  v-for="area in areas"
                  :key="area.id"
                  :value="area.id"
              >
                {{ area.name }}
              </option>
            </select>
          </div>

          <!-- 營業狀態 -->
          <div class="col-md-6">
            <label class="form-label">營業狀態</label>
            <div class="btn-group w-100">
              <button
                  v-for="status in businessStatuses"
                  :key="status.value"
                  type="button"
                  class="btn btn-outline-secondary"
                  :class="{ active: selectedStatus === status.value }"
                  @click="setStatus(status.value)"
              >
                <i :class="status.icon"></i>
                {{ status.label }}
              </button>
            </div>
          </div>

          <!-- 排序方式 -->
          <div class="col-md-6">
            <label class="form-label">排序方式</label>
            <select
                class="form-select"
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

          <!-- 距離範圍 -->
          <div class="col-12" v-if="showDistanceFilter">
            <label class="form-label">
              距離範圍: {{ formatDistance(selectedDistance) }}
            </label>
            <input
                type="range"
                class="form-range"
                min="0"
                max="10"
                step="0.5"
                v-model.number="selectedDistance"
                @input="handleDistanceChange"
            >
            <div class="d-flex justify-content-between">
              <small>0km</small>
              <small>10km</small>
            </div>
          </div>
        </div>
      </div>

      <!-- 已選擇的篩選條件標籤 -->
      <div class="selected-filters mt-3" v-if="hasActiveFilters">
        <div class="d-flex flex-wrap gap-2">
          <span
              v-for="filter in activeFilters"
              :key="filter.id"
              class="badge bg-primary"
          >
            {{ filter.label }}
            <button
                type="button"
                class="btn-close btn-close-white ms-2"
                @click="removeFilter(filter.id)"
            ></button>
          </span>
        </div>
        <button
            class="btn btn-link btn-sm text-decoration-none mt-2"
            @click="clearAllFilters"
        >
          <i class="bi bi-trash"></i>
          清除所有篩選
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { debounce } from '@/utils/helpers';

export default {
  name: 'StoreFilter',

  data() {
    return {
      searchQuery: '',
      selectedCategory: '',
      selectedArea: '',
      selectedStatus: '',
      selectedDistance: 5,
      sortBy: 'distance',
      selectedQuickFilters: [],
      showDistanceFilter: false,

      // 快速篩選標籤
      quickFilterTags: [
        { id: 'parking', name: '提供停車', icon: 'bi bi-p-square' },
        { id: 'wifi', name: '免費WiFi', icon: 'bi bi-wifi' },
        { id: 'discount', name: '優惠中', icon: 'bi bi-tag' },
        { id: 'delivery', name: '外送服務', icon: 'bi bi-bicycle' }
      ],

      // 營業狀態選項
      businessStatuses: [
        { value: '', label: '全部', icon: 'bi bi-circle' },
        { value: 'open', label: '營業中', icon: 'bi bi-shop' },
        { value: 'closed', label: '已打烊', icon: 'bi bi-shop-window' }
      ],

      // 排序選項
      sortOptions: [
        { value: 'distance', label: '距離最近' },
        { value: 'rating', label: '評分最高' },
        { value: 'popularity', label: '最受歡迎' },
        { value: 'name', label: '店名排序' }
      ]
    };
  },

  props: {
    // 商店類別列表
    categories: {
      type: Array,
      default: () => []
    },
    // 地區列表
    areas: {
      type: Array,
      default: () => []
    },
    // 是否啟用距離篩選
    enableDistanceFilter: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    // 判斷是否有啟用的篩選條件
    hasActiveFilters() {
      return this.activeFilters.length > 0;
    },

    // 取得目前啟用的篩選條件
    activeFilters() {
      const filters = [];

      if (this.searchQuery) {
        filters.push({
          id: 'search',
          label: `搜尋: ${this.searchQuery}`
        });
      }

      if (this.selectedCategory) {
        const category = this.categories.find(c => c.id === this.selectedCategory);
        if (category) {
          filters.push({
            id: 'category',
            label: `類別: ${category.name}`
          });
        }
      }

      if (this.selectedArea) {
        const area = this.areas.find(a => a.id === this.selectedArea);
        if (area) {
          filters.push({
            id: 'area',
            label: `地區: ${area.name}`
          });
        }
      }

      if (this.selectedStatus) {
        const status = this.businessStatuses.find(s => s.value === this.selectedStatus);
        if (status) {
          filters.push({
            id: 'status',
            label: `狀態: ${status.label}`
          });
        }
      }

      this.selectedQuickFilters.forEach(filterId => {
        const tag = this.quickFilterTags.find(t => t.id === filterId);
        if (tag) {
          filters.push({
            id: `quick-${filterId}`,
            label: tag.name
          });
        }
      });

      return filters;
    }
  },

  methods: {
    // 處理搜尋輸入
    handleSearch: debounce(function() {
      this.emitFilterChange();
    }, 300),

    // 清除搜尋
    clearSearch() {
      this.searchQuery = '';
      this.emitFilterChange();
    },

    // 切換快速篩選標籤
    toggleQuickFilter(tagId) {
      const index = this.selectedQuickFilters.indexOf(tagId);
      if (index === -1) {
        this.selectedQuickFilters.push(tagId);
      } else {
        this.selectedQuickFilters.splice(index, 1);
      }
      this.emitFilterChange();
    },

    // 處理篩選變更
    handleFilter() {
      this.emitFilterChange();
    },

    // 設置營業狀態
    setStatus(status) {
      this.selectedStatus = status;
      this.emitFilterChange();
    },

    // 處理排序變更
    handleSort() {
      this.emitFilterChange();
    },

    // 處理距離變更
    handleDistanceChange: debounce(function() {
      this.emitFilterChange();
    }, 300),

    // 移除篩選條件
    removeFilter(filterId) {
      if (filterId === 'search') {
        this.searchQuery = '';
      } else if (filterId === 'category') {
        this.selectedCategory = '';
      } else if (filterId === 'area') {
        this.selectedArea = '';
      } else if (filterId === 'status') {
        this.selectedStatus = '';
      } else if (filterId.startsWith('quick-')) {
        const tagId = filterId.replace('quick-', '');
        const index = this.selectedQuickFilters.indexOf(tagId);
        if (index !== -1) {
          this.selectedQuickFilters.splice(index, 1);
        }
      }
      this.emitFilterChange();
    },

    // 清除所有篩選條件
    clearAllFilters() {
      this.searchQuery = '';
      this.selectedCategory = '';
      this.selectedArea = '';
      this.selectedStatus = '';
      this.selectedQuickFilters = [];
      this.sortBy = 'distance';
      this.selectedDistance = 5;
      this.emitFilterChange();
    },

    // 格式化距離顯示
    formatDistance(distance) {
      return `${distance}公里`;
    },

    // 發送篩選條件變更事件
    emitFilterChange() {
      this.$emit('filter-change', {
        search: this.searchQuery,
        category: this.selectedCategory,
        area: this.selectedArea,
        status: this.selectedStatus,
        quickFilters: this.selectedQuickFilters,
        sortBy: this.sortBy,
        distance: this.selectedDistance
      });
    }
  },

  watch: {
    // 監聽是否啟用距離篩選
    enableDistanceFilter: {
      immediate: true,
      handler(newValue) {
        this.showDistanceFilter = newValue;
      }
    }
  },

  created() {
    // 初始化時發送一次篩選條件
    this.emitFilterChange();
  }
};
</script>

<style scoped>
.store-filter {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.filter-container {
  max-width: 1200px;
  margin: 0 auto;
}

.quick-filters .btn {
  border-radius: 20px;
  padding: 0.375rem 0.75rem;
}

.quick-filters .btn i {
  margin-right: 0.25rem;
}

.advanced-filters {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.form-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.selected-filters .badge {
  padding: 0.5rem 0.75rem;
  font-weight: normal;
}

.btn-close {
  font-size: 0.75rem;
}

.form-range::-webkit-slider-thumb {
  background: var(--bs-primary);
}

.form-range::-moz-range-thumb {
  background: var(--bs-primary);
}

@media (max-width: 768px) {
  .store-filter {
    padding: 1rem;
  }

  .advanced-filters {
    padding: 1rem;
  }
}
</style>
