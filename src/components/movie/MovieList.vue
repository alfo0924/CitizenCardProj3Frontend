<template>
  <div class="movie-list">
    <!-- 搜尋和篩選區域 -->
    <div class="filters mb-4">
      <div class="row g-3">
        <div class="col-md-4">
          <input
              type="text"
              class="form-control"
              placeholder="搜尋電影"
              v-model="searchKeyword"
              @input="handleSearch"
          >
        </div>
        <div class="col-md-3">
          <select
              class="form-select"
              v-model="selectedCategory"
              @change="filterMovies"
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
              v-model="selectedStatus"
              @change="filterMovies"
          >
            <option value="">所有狀態</option>
            <option value="SHOWING">上映中</option>
            <option value="COMING">即將上映</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 載入中狀態 -->
    <div v-if="isLoading" class="loading">
      <LoadingSpinner />
    </div>

    <!-- 錯誤提示 -->
    <div v-else-if="error" class="error">
      <div class="alert alert-danger" role="alert">
        {{ error }}
      </div>
    </div>

    <!-- 無數據提示 -->
    <div v-else-if="movies.length === 0" class="no-data">
      <div class="text-center text-muted">
        <i class="fas fa-film fa-3x mb-3"></i>
        <h5>暫無電影資料</h5>
        <p>請稍後再試或調整搜尋條件</p>
      </div>
    </div>

    <!-- 電影列表 -->
    <div v-else class="movie-grid">
      <div class="row g-4">
        <div
            v-for="movie in movies"
            :key="movie.id"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
        >
          <MovieCard
              :movie="movie"
              @click="handleMovieClick(movie)"
          />
        </div>
      </div>

      <!-- 分頁 -->
      <nav v-if="totalPages > 1" class="mt-4">
        <ul class="pagination justify-content-center">
          <li
              class="page-item"
              :class="{ disabled: currentPage === 1 }"
          >
            <button
                class="page-link"
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
            >
              <i class="fas fa-chevron-left"></i>
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
                :disabled="currentPage === totalPages"
            >
              <i class="fas fa-chevron-right"></i>
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
import MovieCard from '@/components/movie/MovieCard.vue'

export default {
  name: 'MovieList',

  components: {
    LoadingSpinner,
    MovieCard
  },

  setup() {
    const store = useStore()
    const router = useRouter()

    // 狀態
    const searchKeyword = ref('')
    const selectedCategory = ref('')
    const selectedStatus = ref('')
    const currentPage = ref(1)
    const pageSize = ref(12)

    // 從store獲取數據
    const movies = computed(() => store.state.movie.movies)
    const categories = computed(() => store.state.movie.categories)
    const totalPages = computed(() => store.state.movie.totalPages)
    const isLoading = computed(() => store.state.movie.isLoading)
    const error = computed(() => store.state.movie.error)

    // 分頁顯示
    const displayedPages = computed(() => {
      const range = []
      const delta = 2
      for (
          let i = Math.max(1, currentPage.value - delta);
          i <= Math.min(totalPages.value, currentPage.value + delta);
          i++
      ) {
        range.push(i)
      }
      return range
    })

    // 獲取電影列表
    const fetchMovies = async () => {
      await store.dispatch('movie/fetchMovies', {
        page: currentPage.value,
        size: pageSize.value,
        category: selectedCategory.value,
        status: selectedStatus.value,
        search: searchKeyword.value
      })
    }

    // 獲取電影分類
    const fetchCategories = async () => {
      await store.dispatch('movie/fetchCategories')
    }

    // 搜尋處理
    const handleSearch = () => {
      currentPage.value = 1
      fetchMovies()
    }

    // 篩選處理
    const filterMovies = () => {
      currentPage.value = 1
      fetchMovies()
    }

    // 換頁
    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        fetchMovies()
      }
    }

    // 點擊電影卡片
    const handleMovieClick = (movie) => {
      router.push({
        name: 'movie-detail',
        params: { id: movie.id }
      })
    }

    onMounted(() => {
      fetchCategories()
      fetchMovies()
    })

    return {
      searchKeyword,
      selectedCategory,
      selectedStatus,
      currentPage,
      movies,
      categories,
      totalPages,
      isLoading,
      error,
      displayedPages,
      handleSearch,
      filterMovies,
      changePage,
      handleMovieClick
    }
  }
}
</script>

<style scoped>
.movie-list {
  padding: 2rem 0;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.error {
  text-align: center;
  padding: 2rem;
}

.no-data {
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem;
}

.movie-grid {
  margin-top: 2rem;
}

.pagination {
  margin-bottom: 0;
}

.pagination .page-link {
  padding: 0.5rem 0.75rem;
  color: var(--primary-color);
  background-color: white;
  border: 1px solid var(--border-color);
}

.pagination .page-link:hover {
  background-color: var(--bg-light);
  border-color: var(--border-color);
}

.pagination .page-item.active .page-link {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.pagination .page-item.disabled .page-link {
  color: var(--text-light);
  background-color: var(--bg-light);
  border-color: var(--border-color);
}

@media (max-width: 768px) {
  .filters .row {
    row-gap: 1rem;
  }

  .pagination .page-link {
    padding: 0.375rem 0.5rem;
    font-size: 0.875rem;
  }
}
</style>
