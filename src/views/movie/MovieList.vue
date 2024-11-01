<template>
  <div class="movie-list-container">
    <!-- 頂部過濾和搜索區 -->
    <div class="filter-section mb-4">
      <div class="row g-3">
        <!-- 搜索框 -->
        <div class="col-md-4">
          <div class="input-group">
            <input
                type="text"
                class="form-control"
                v-model="searchQuery"
                @input="handleSearch"
                placeholder="搜尋電影名稱..."
            >
            <button class="btn btn-outline-primary" type="button">
              <i class="fas fa-search"></i>
            </button>
          </div>
        </div>

        <!-- 分類過濾 -->
        <div class="col-md-3">
          <select
              class="form-select"
              v-model="selectedCategory"
              @change="filterMovies"
          >
            <option value="">所有類別</option>
            <option
                v-for="category in categories"
                :key="category.categoryId"
                :value="category.categoryId"
            >
              {{ category.categoryName }}
            </option>
          </select>
        </div>

        <!-- 狀態過濾 -->
        <div class="col-md-5">
          <div class="btn-group w-100">
            <button
                v-for="status in movieStatuses"
                :key="status.value"
                class="btn"
                :class="[selectedStatus === status.value ? 'btn-primary' : 'btn-outline-primary']"
                @click="filterByStatus(status.value)"
            >
              {{ status.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 載入中狀態 -->
    <LoadingSpinner v-if="isLoading" />

    <!-- 錯誤提示 -->
    <AlertMessage
        v-if="error"
        type="error"
        :message="error"
    />

    <!-- 無結果提示 -->
    <div v-else-if="filteredMovies.length === 0" class="text-center py-5">
      <i class="fas fa-film fa-3x mb-3 text-muted"></i>
      <p class="text-muted">沒有找到符合條件的電影</p>
    </div>

    <!-- 電影列表 -->
    <div v-else class="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
      <div
          v-for="movie in filteredMovies"
          :key="movie.movieId"
          class="col"
      >
        <MovieCard :movie="movie" />
      </div>
    </div>

    <!-- 分頁控制 -->
    <nav v-if="totalPages > 1" class="mt-4">
      <ul class="pagination justify-content-center">
        <!-- 上一頁 -->
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button
              class="page-link"
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
        </li>

        <!-- 頁碼 -->
        <li
            v-for="page in displayedPages"
            :key="page"
            class="page-item"
            :class="{ active: currentPage === page, disabled: page === '...' }"
        >
          <button
              class="page-link"
              @click="page !== '...' && changePage(page)"
          >
            {{ page }}
          </button>
        </li>

        <!-- 下一頁 -->
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button
              class="page-link"
              @click="changePage(currentPage + 1)"
              :disabled="currentPage === totalPages"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { debounce } from 'lodash'
import MovieCard from '@/components/movie/MovieCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'

export default {
  name: 'MovieList',

  components: {
    MovieCard,
    LoadingSpinner,
    AlertMessage
  },

  setup() {
    const store = useStore()

    // 狀態
    const isLoading = ref(false)
    const error = ref(null)
    const searchQuery = ref('')
    const selectedCategory = ref('')
    const selectedStatus = ref('')
    const currentPage = ref(1)
    const pageSize = ref(12)

    // 電影狀態選項
    const movieStatuses = [
      { value: '', label: '全部' },
      { value: 'SHOWING', label: '熱映中' },
      { value: 'COMING', label: '即將上映' },
      { value: 'ENDED', label: '已下檔' }
    ]

    // 從 store 獲取數據
    const movies = computed(() => store.state.movie.movies)
    const categories = computed(() => store.state.movie.categories)
    const totalMovies = computed(() => store.state.movie.total)

    // 計算總頁數
    const totalPages = computed(() =>
        Math.ceil(totalMovies.value / pageSize.value)
    )

    // 計算顯示的頁碼
    const displayedPages = computed(() => {
      const delta = 2
      const range = []
      const rangeWithDots = []
      let l

      for (let i = 1; i <= totalPages.value; i++) {
        if (
            i === 1 ||
            i === totalPages.value ||
            i >= currentPage.value - delta &&
            i <= currentPage.value + delta
        ) {
          range.push(i)
        }
      }

      range.forEach(i => {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1)
          } else if (i - l !== 1) {
            rangeWithDots.push('...')
          }
        }
        rangeWithDots.push(i)
        l = i
      })

      return rangeWithDots
    })

    // 過濾電影列表
    const filteredMovies = computed(() => {
      let result = [...movies.value]

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(movie =>
            movie.movieName.toLowerCase().includes(query)
        )
      }

      if (selectedCategory.value) {
        result = result.filter(movie =>
            movie.categoryId === selectedCategory.value
        )
      }

      if (selectedStatus.value) {
        result = result.filter(movie =>
            movie.status === selectedStatus.value
        )
      }

      return result
    })

    // 獲取電影列表
    const fetchMovies = async () => {
      try {
        isLoading.value = true
        error.value = null
        await store.dispatch('movie/fetchMovies', {
          page: currentPage.value,
          size: pageSize.value,
          category: selectedCategory.value,
          status: selectedStatus.value,
          search: searchQuery.value
        })
      } catch (err) {
        error.value = '載入電影列表失敗，請稍後再試'
        console.error('Error fetching movies:', err)
      } finally {
        isLoading.value = false
      }
    }

    // 搜索處理（使用防抖）
    const handleSearch = debounce(() => {
      currentPage.value = 1
      fetchMovies()
    }, 500)

    // 過濾處理
    const filterMovies = () => {
      currentPage.value = 1
      fetchMovies()
    }

    // 狀態過濾
    const filterByStatus = (status) => {
      selectedStatus.value = status
      currentPage.value = 1
      fetchMovies()
    }

    // 換頁處理
    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        fetchMovies()
      }
    }

    // 初始化
    onMounted(async () => {
      await Promise.all([
        store.dispatch('movie/fetchCategories'),
        fetchMovies()
      ])
    })

    return {
      isLoading,
      error,
      searchQuery,
      selectedCategory,
      selectedStatus,
      currentPage,
      movies,
      categories,
      movieStatuses,
      totalPages,
      displayedPages,
      filteredMovies,
      handleSearch,
      filterMovies,
      filterByStatus,
      changePage
    }
  }
}
</script>

<style scoped>
.movie-list-container {
  padding: 2rem 0;
}

.filter-section {
  background-color: white;
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
}

.input-group .form-control:focus {
  border-color: var(--primary-color);
  box-shadow: none;
}

.form-select:focus {
  border-color: var(--primary-color);
  box-shadow: none;
}

.btn-group .btn {
  flex: 1;
  transition: all 0.3s ease;
}

.btn-group .btn:hover {
  transform: translateY(-1px);
}

.pagination {
  margin-bottom: 0;
}

.page-link {
  color: var(--primary-color);
  border-color: var(--border-color);
  padding: 0.5rem 1rem;
  min-width: 40px;
  text-align: center;
}

.page-item.active .page-link {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.page-link:hover {
  color: var(--primary-dark);
  background-color: var(--bg-light);
}

@media (max-width: 768px) {
  .filter-section {
    padding: 1rem;
  }

  .btn-group {
    flex-wrap: wrap;
  }

  .btn-group .btn {
    flex: 1 1 auto;
    margin-bottom: 0.5rem;
  }
}
</style>