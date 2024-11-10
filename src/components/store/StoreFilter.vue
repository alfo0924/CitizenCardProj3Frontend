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
              placeholder="搜尋商店名稱、地址或商品..."
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
          <div class="col-md-4">
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
          <div class="col-md-4">
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

          <!-- 排序方式 -->
          <div class="col-md-4">
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

          <!-- 距離範圍 -->
          <div class="col-md-6" v-if="showDistanceFilter">
            <label class="form-label">
              距離範圍: {{ formatDistance(selectedDistance) }}
            </label>
            <div class="range-container">
              <input
                  type="range"
                  class="form-range"
                  min="0"
                  max="10"
                  step="0.5"
                  v-model.number="selectedDistance"
                  @input="handleDistanceChange"
              >
              <div class="range-labels d-flex justify-content-between">
                <small>0km</small>
                <small>5km</small>
                <small>10km</small>
              </div>
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
import { ref, computed } from 'vue'
import { debounce } from '@/utils/helpers'

export default {
  name: 'StoreFilter',

  props: {
    categories: {
      type: Array,
      default: () => []
    },
    areas: {
      type: Array,
      default: () => []
    },
    enableDistanceFilter: {
      type: Boolean,
      default: false
    }
  },

  emits: ['filter-change'],

  setup(props, { emit }) {
    // 基本狀態
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const selectedArea = ref('')
    const selectedStatus = ref('')
    const selectedDistance = ref(5)
    const sortBy = ref('distance')
    const selectedQuickFilters = ref([])
    const showDistanceFilter = ref(props.enableDistanceFilter)

    // 固定選項
    const quickFilterTags = [
      { id: 'parking', name: '提供停車', icon: 'bi bi-p-square' },
      { id: 'wifi', name: '免費WiFi', icon: 'bi bi-wifi' },
      { id: 'discount', name: '優惠中', icon: 'bi bi-tag' },
      { id: 'delivery', name: '外送服務', icon: 'bi bi-bicycle' }
    ]

    const businessStatuses = [
      { value: '', label: '全部', icon: 'bi bi-circle' },
      { value: 'open', label: '營業中', icon: 'bi bi-shop' },
      { value: 'closed', label: '已打烊', icon: 'bi bi-shop-window' }
    ]

    const sortOptions = [
      { value: 'distance', label: '距離最近' },
      { value: 'rating', label: '評分最高' },
      { value: 'popularity', label: '最受歡迎' },
      { value: 'name', label: '店名排序' }
    ]

    // 計算屬性
    const hasActiveFilters = computed(() => {
      return activeFilters.value.length > 0
    })

    const activeFilters = computed(() => {
      const filters = []

      if (searchQuery.value) {
        filters.push({
          id: 'search',
          label: `搜尋: ${searchQuery.value}`
        })
      }

      if (selectedCategory.value) {
        const category = props.categories.find(c => c.id === selectedCategory.value)
        if (category) {
          filters.push({
            id: 'category',
            label: `類別: ${category.name}`
          })
        }
      }

      if (selectedArea.value) {
        const area = props.areas.find(a => a.id === selectedArea.value)
        if (area) {
          filters.push({
            id: 'area',
            label: `地區: ${area.name}`
          })
        }
      }

      if (selectedStatus.value) {
        const status = businessStatuses.find(s => s.value === selectedStatus.value)
        if (status) {
          filters.push({
            id: 'status',
            label: `狀態: ${status.label}`
          })
        }
      }

      selectedQuickFilters.value.forEach(filterId => {
        const tag = quickFilterTags.find(t => t.id === filterId)
        if (tag) {
          filters.push({
            id: `quick-${filterId}`,
            label: tag.name
          })
        }
      })

      return filters
    })

    // 方法
    const emitFilterChange = () => {
      emit('filter-change', {
        search: searchQuery.value,
        category: selectedCategory.value,
        area: selectedArea.value,
        status: selectedStatus.value,
        quickFilters: selectedQuickFilters.value,
        sortBy: sortBy.value,
        distance: selectedDistance.value
      })
    }

    const handleSearch = debounce(() => {
      emitFilterChange()
    }, 300)

    const clearSearch = () => {
      searchQuery.value = ''
      emitFilterChange()
    }

    const toggleQuickFilter = (tagId) => {
      const index = selectedQuickFilters.value.indexOf(tagId)
      if (index === -1) {
        selectedQuickFilters.value.push(tagId)
      } else {
        selectedQuickFilters.value.splice(index, 1)
      }
      emitFilterChange()
    }

    const handleFilter = () => {
      emitFilterChange()
    }

    const setStatus = (status) => {
      selectedStatus.value = status
      emitFilterChange()
    }

    const handleSort = () => {
      emitFilterChange()
    }

    const handleDistanceChange = debounce(() => {
      emitFilterChange()
    }, 300)

    const removeFilter = (filterId) => {
      if (filterId === 'search') {
        searchQuery.value = ''
      } else if (filterId === 'category') {
        selectedCategory.value = ''
      } else if (filterId === 'area') {
        selectedArea.value = ''
      } else if (filterId === 'status') {
        selectedStatus.value = ''
      } else if (filterId.startsWith('quick-')) {
        const tagId = filterId.replace('quick-', '')
        const index = selectedQuickFilters.value.indexOf(tagId)
        if (index !== -1) {
          selectedQuickFilters.value.splice(index, 1)
        }
      }
      emitFilterChange()
    }

    const clearAllFilters = () => {
      searchQuery.value = ''
      selectedCategory.value = ''
      selectedArea.value = ''
      selectedStatus.value = ''
      selectedQuickFilters.value = []
      sortBy.value = 'distance'
      selectedDistance.value = 5
      emitFilterChange()
    }

    const formatDistance = (distance) => {
      return `${distance}公里`
    }

    return {
      // 狀態
      searchQuery,
      selectedCategory,
      selectedArea,
      selectedStatus,
      selectedDistance,
      sortBy,
      selectedQuickFilters,
      showDistanceFilter,
      quickFilterTags,
      businessStatuses,
      sortOptions,

      // 計算屬性
      hasActiveFilters,
      activeFilters,

      // 方法
      handleSearch,
      clearSearch,
      toggleQuickFilter,
      handleFilter,
      setStatus,
      handleSort,
      handleDistanceChange,
      removeFilter,
      clearAllFilters,
      formatDistance
    }
  }
}
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
  transition: all 0.2s ease;
}

.quick-filters .btn i {
  margin-right: 0.25rem;
}

.quick-filters .btn.active {
  background-color: var(--bs-primary);
  color: white;
  border-color: var(--bs-primary);
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
  color: #495057;
}

.selected-filters .badge {
  padding: 0.5rem 0.75rem;
  font-weight: normal;
  display: inline-flex;
  align-items: center;
}

.btn-close {
  font-size: 0.75rem;
  padding: 0.25rem;
}

.range-container {
  padding: 0 0.5rem;
}

.form-range::-webkit-slider-thumb {
  background: var(--bs-primary);
}

.form-range::-moz-range-thumb {
  background: var(--bs-primary);
}

.range-labels {
  margin-top: 0.5rem;
  color: #6c757d;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .store-filter {
    padding: 1rem;
  }

  .advanced-filters {
    padding: 1rem;
  }

  .quick-filters .btn {
    font-size: 0.875rem;
  }
}
</style>
