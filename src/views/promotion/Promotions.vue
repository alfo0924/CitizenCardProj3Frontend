<template>
  <div class="promotions-page">
    <!-- 頁面標題區 -->
    <div class="page-header bg-light py-4">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h2 class="mb-2">優惠活動</h2>
            <p class="text-muted mb-0">
              探索最新優惠活動，享受專屬優惠
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="container py-4">
      <!-- 篩選區域 -->
      <div class="filter-section bg-white p-3 rounded shadow-sm mb-4">
        <div class="row g-3">
          <!-- 搜尋框 -->
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-white">
                <i class="bi bi-search"></i>
              </span>
              <input
                  type="text"
                  class="form-control"
                  v-model="searchQuery"
                  placeholder="搜尋活動..."
                  @input="handleSearch"
              >
            </div>
          </div>

          <!-- 活動類別 -->
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

          <!-- 活動狀態 -->
          <div class="col-md-3">
            <select
                class="form-select"
                v-model="selectedStatus"
                @change="handleFilter"
            >
              <option value="">所有狀態</option>
              <option value="ongoing">進行中</option>
              <option value="upcoming">即將開始</option>
              <option value="ended">已結束</option>
            </select>
          </div>

          <!-- 排序方式 -->
          <div class="col-md-2">
            <select
                class="form-select"
                v-model="sortBy"
                @change="handleSort"
            >
              <option value="newest">最新活動</option>
              <option value="popular">最熱門</option>
              <option value="endingSoon">即將結束</option>
            </select>
          </div>
        </div>
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

      <!-- 活動列表 -->
      <div v-if="!loading && !error" class="row g-4">
        <div
            v-for="promotion in promotions"
            :key="promotion.id"
            class="col-md-6 col-lg-4"
        >
          <div class="card h-100 promotion-card">
            <!-- 活動圖片 -->
            <div class="promotion-image">
              <img
                  :src="promotion.imageUrl || require('@/assets/images/default-promotion.jpg')"
                  :alt="promotion.title"
                  class="card-img-top"
                  @error="handleImageError"
              >
              <span
                  :class="['status-badge', getStatusClass(promotion.status)]"
              >
                {{ getStatusText(promotion.status) }}
              </span>
            </div>

            <div class="card-body">
              <!-- 活動標題 -->
              <h5 class="card-title">{{ promotion.title }}</h5>

              <!-- 活動描述 -->
              <p class="card-text text-muted">
                {{ truncateText(promotion.description, 100) }}
              </p>

              <!-- 活動時間 -->
              <div class="promotion-time mb-3">
                <i class="bi bi-calendar3"></i>
                <span>{{ formatDate(promotion.startDate) }} - {{ formatDate(promotion.endDate) }}</span>
              </div>

              <!-- 參與人數 -->
              <div class="promotion-stats mb-3">
                <span class="me-3">
                  <i class="bi bi-people"></i>
                  {{ promotion.participantCount }} 人參與
                </span>
                <span>
                  <i class="bi bi-heart"></i>
                  {{ promotion.favoriteCount }} 人收藏
                </span>
              </div>

              <!-- 操作按鈕 -->
              <div class="d-flex justify-content-between align-items-center">
                <router-link
                    :to="{ name: 'promotion-detail', params: { id: promotion.id }}"
                    class="btn btn-primary"
                >
                  查看詳情
                </router-link>
                <button
                    class="btn btn-outline-primary"
                    @click="toggleFavorite(promotion)"
                    :disabled="promotion.status === 'ended'"
                >
                  <i :class="['bi', promotion.isFavorite ? 'bi-heart-fill' : 'bi-heart']"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 無結果提示 -->
        <div
            v-if="!loading && promotions.length === 0"
            class="col-12 text-center py-5"
        >
          <i class="bi bi-search display-1 text-muted"></i>
          <p class="mt-3">沒有找到符合條件的活動</p>
        </div>
      </div>

      <!-- 分頁控制 -->
      <nav
          v-if="!loading && totalPages > 1"
          class="mt-4"
          aria-label="Promotion navigation"
      >
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
</template>
<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'
import { debounce } from '@/utils/helpers'

export default {
  name: 'Promotions',

  components: {
    LoadingSpinner,
    AlertMessage
  },

  setup() {
    const store = useStore()
    const router = useRouter()

    // 響應式狀態
    const loading = ref(false)
    const error = ref('')
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const selectedStatus = ref('')
    const sortBy = ref('newest')
    const currentPage = ref(1)
    const itemsPerPage = 12
    const promotions = ref([])
    const categories = ref([])
    const totalItems = ref(0)

    // 計算屬性
    const totalPages = computed(() => {
      return Math.ceil(totalItems.value / itemsPerPage)
    })

    const displayedPages = computed(() => {
      const delta = 2
      const range = []
      for (
          let i = Math.max(1, currentPage.value - delta);
          i <= Math.min(totalPages.value, currentPage.value + delta);
          i++
      ) {
        range.push(i)
      }
      return range
    })

    // 方法
    const fetchPromotions = async () => {
      loading.value = true
      error.value = ''
      try {
        const response = await store.dispatch('promotion/fetchPromotions', {
          page: currentPage.value,
          size: itemsPerPage,
          category: selectedCategory.value,
          status: selectedStatus.value,
          sort: sortBy.value,
          search: searchQuery.value
        })
        promotions.value = response.data.content
        totalItems.value = response.data.totalElements
      } catch (err) {
        error.value = '載入活動資料失敗，請稍後再試'
        console.error('Error fetching promotions:', err)
      } finally {
        loading.value = false
      }
    }

    const fetchCategories = async () => {
      try {
        const response = await store.dispatch('promotion/fetchCategories')
        categories.value = response.data
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    }

    const handleSearch = debounce(() => {
      currentPage.value = 1
      fetchPromotions()
    }, 300)

    const handleFilter = () => {
      currentPage.value = 1
      fetchPromotions()
    }

    const handleSort = () => {
      fetchPromotions()
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        fetchPromotions()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    const toggleFavorite = async (promotion) => {
      if (!store.getters['auth/isLoggedIn']) {
        router.push({
          name: 'login',
          query: { redirect: router.currentRoute.value.fullPath }
        })
        return
      }

      try {
        await store.dispatch('promotion/toggleFavorite', {
          promotionId: promotion.id,
          isFavorite: !promotion.isFavorite
        })
        promotion.isFavorite = !promotion.isFavorite
        promotion.favoriteCount += promotion.isFavorite ? 1 : -1
      } catch (err) {
        error.value = '操作失敗，請稍後再試'
        console.error('Error toggling favorite:', err)
      }
    }

    const getStatusClass = (status) => {
      const statusMap = {
        'ongoing': 'status-ongoing',
        'upcoming': 'status-upcoming',
        'ended': 'status-ended'
      }
      return statusMap[status] || 'status-default'
    }

    const getStatusText = (status) => {
      const statusMap = {
        'ongoing': '進行中',
        'upcoming': '即將開始',
        'ended': '已結束'
      }
      return statusMap[status] || status
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-TW')
    }

    const truncateText = (text, length) => {
      if (text.length <= length) return text
      return text.substring(0, length) + '...'
    }

    const handleImageError = (event) => {
      event.target.src = require('@/assets/images/default-promotion.jpg')
    }

    // 生命週期鉤子
    onMounted(() => {
      fetchCategories()
      fetchPromotions()
    })

    return {
      // 狀態
      loading,
      error,
      searchQuery,
      selectedCategory,
      selectedStatus,
      sortBy,
      currentPage,
      promotions,
      categories,

      // 計算屬性
      totalPages,
      displayedPages,

      // 方法
      handleSearch,
      handleFilter,
      handleSort,
      changePage,
      toggleFavorite,
      getStatusClass,
      getStatusText,
      formatDate,
      truncateText,
      handleImageError
    }
  }
}
</script>

<style scoped>
.promotions-page {
  min-height: 100vh;
  padding-top: 60px;
  background-color: #f8f9fa;
}

.page-header {
  background-color: white;
  border-bottom: 1px solid #dee2e6;
}

.filter-section {
  border: 1px solid #dee2e6;
}

.promotion-card {
  transition: transform 0.2s ease;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.promotion-card:hover {
  transform: translateY(-5px);
}

.promotion-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.promotion-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
}

.status-ongoing {
  background-color: #28a745;
}

.status-upcoming {
  background-color: #007bff;
}

.status-ended {
  background-color: #6c757d;
}

.status-default {
  background-color: #6c757d;
}

.promotion-time {
  font-size: 0.875rem;
  color: #6c757d;
}

.promotion-time i {
  margin-right: 0.5rem;
}

.promotion-stats {
  font-size: 0.875rem;
  color: #6c757d;
}

.promotion-stats i {
  margin-right: 0.25rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.card-text {
  font-size: 0.875rem;
  line-height: 1.5;
}

.pagination {
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .filter-section {
    padding: 1rem;
  }

  .promotion-image {
    height: 150px;
  }
}
</style>
