<template>
  <div class="movie-management">
    <div class="container">
      <!-- 載入中狀態 -->
      <LoadingSpinner v-if="isLoading" />

      <!-- 錯誤提示 -->
      <AlertMessage v-if="error" type="error" :message="error" />

      <!-- 管理介面 -->
      <div class="management-content">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div class="d-flex align-items-center">
            <button class="btn btn-outline-secondary me-3" @click="goBack">
              <i class="fas fa-arrow-left me-1"></i>返回
            </button>
            <h2>電影管理</h2>
          </div>
          <button class="btn btn-primary" @click="openMovieModal()">
            <i class="fas fa-plus me-2"></i>新增電影
          </button>
        </div>

        <!-- 搜尋和篩選 -->
        <div class="filters mb-4">
          <div class="row g-3">
            <div class="col-md-4">
              <input
                  type="text"
                  class="form-control"
                  placeholder="搜尋電影"
                  v-model="searchKeyword"
                  @input="handleSearch"
                  :disabled="isLoading"
              >
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
                <option value="ENDED">已下檔</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 電影列表 -->
        <div class="table-responsive" v-show="!isLoading">
          <table class="table">
            <thead>
            <tr>
              <th>海報</th>
              <th>電影名稱</th>
              <th>上映日期</th>
              <th>下檔日期</th>
              <th>片長</th>
              <th>導演</th>
              <th>類型</th>
              <th>票價</th>
              <th>評分</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
            </thead>
            <tbody>
          <tr v-for="movie in movies" :key="movie.id">
            <td>
              <img
                  :src="movie.poster_url || require('@/assets/images/default-poster.jpg')"
                  :alt="movie.title"
                  class="movie-poster"
              >
            </td>
            <td>{{ movie.title }}</td>
            <td>{{ formatDate(movie.release_date) }}</td>
            <td>{{ formatDate(movie.end_date) }}</td>
            <td>{{ movie.duration }}分鐘</td>
            <td>{{ movie.director || '尚未設定' }}</td>
            <td>{{ movie.genre || '未分類' }}</td>
            <td>${{ movie.price || 0 }}</td>
            <td>
      <span
          class="badge"
          :class="getStatusClass(movie.is_showing)"
      >
        {{ getStatusText(movie.is_showing) }}
      </span>
            </td>
            <td>
              <button
                  class="btn btn-sm btn-outline-primary me-2"
                  @click="openMovieModal(movie)"
              >
                編輯
              </button>
              <button
                  class="btn btn-sm btn-outline-danger"
                  @click="confirmDelete(movie)"
              >
                刪除
              </button>
            </td>
          </tr>
          </tbody>
          </table>
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

    <!-- 電影編輯Modal -->
    <div
        class="modal fade"
        id="movieModal"
        tabindex="-1"
        ref="movieModal"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editingMovie.id ? '編輯電影' : '新增電影' }}
            </h5>
            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveMovie">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">電影名稱</label>
                  <input
                      type="text"
                      class="form-control"
                      v-model="editingMovie.title"
                      required
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">導演</label>
                  <input
                      type="text"
                      class="form-control"
                      v-model="editingMovie.director"
                      required
                  >
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">上映日期</label>
                  <input
                      type="date"
                      class="form-control"
                      v-model="editingMovie.release_date"
                      required
                  >
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">下檔日期</label>
                  <input
                      type="date"
                      class="form-control"
                      v-model="editingMovie.end_date"
                      required
                  >
                </div>
              </div>
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label">片長（分鐘）</label>
                  <input
                      type="number"
                      class="form-control"
                      v-model="editingMovie.duration"
                      required
                      min="1"
                  >
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">電影類型</label>
                  <input
                      type="text"
                      class="form-control"
                      v-model="editingMovie.genre"
                      required
                  >
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">票價</label>
                  <input
                      type="number"
                      class="form-control"
                      v-model="editingMovie.price"
                      required
                      min="0"
                  >
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">卡司</label>
                <input
                    type="text"
                    class="form-control"
                    v-model="editingMovie.cast"
                    required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">電影介紹</label>
                <textarea
                    class="form-control"
                    v-model="editingMovie.description"
                    rows="3"
                    required
                ></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">預告片連結</label>
                <input
                    type="url"
                    class="form-control"
                    v-model="editingMovie.trailerUrl"
                >
              </div>
              <div class="mb-3">
                <label class="form-label">海報圖片</label>
                <input
                    type="file"
                    class="form-control"
                    @change="handleImageUpload"
                    accept="image/*"
                >
                <div v-if="editingMovie.posterUrl" class="mt-2">
                  <img :src="editingMovie.posterUrl" class="preview-poster">
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">狀態</label>
                <select
                    class="form-select"
                    v-model="editingMovie.isShowing"
                    required
                >
                  <option :value="true">上映中</option>
                  <option :value="false">未上映</option>
                </select>
              </div>
              <div class="text-end">
                <button
                    type="button"
                    class="btn btn-secondary me-2"
                    data-bs-dismiss="modal"
                >
                  取消
                </button>
                <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="isProcessing"
                >
      <span
          v-if="isProcessing"
          class="spinner-border spinner-border-sm me-2"
      ></span>
                  {{ isProcessing ? '處理中...' : '儲存' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { Modal } from 'bootstrap'
import Swal from 'sweetalert2'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'
import { useRouter } from "vue-router"
import { debounce } from 'lodash'
import { apiService } from '@/services/api.config'

export default {
  name: 'MovieManagement',
  components: {
    LoadingSpinner,
    AlertMessage
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const movieModal = ref(null)
    const modalInstance = ref(null)
    const isLoading = ref(false)
    const error = ref(null)
    const isProcessing = ref(false)
    const searchKeyword = ref('')
    const selectedStatus = ref('')
    const currentPage = ref(1)
    const editingMovie = ref({
      title: '',
      release_date: '',
      end_date: '',
      duration: '',
      description: '',
      director: '',
      genre: '',
      price: 0,
      is_showing: true,
      poster_url: ''
    })

    const goBack = () => {
      router.back()
    }

    const movies = computed(() => {
      return store.state.movie.movies || []
    })

    const totalPages = computed(() => store.state.movie.totalPages || 1)

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

    const debouncedSearch = debounce(() => {
      fetchMovies()
    }, 500)

    const previousParams = ref(null)

    const fetchMovies = async () => {
      const currentParams = {
        page: currentPage.value - 1,
        size: 10,
        status: selectedStatus.value,
        keyword: searchKeyword.value,
        sort: 'releaseDate,desc'
      }

      if (previousParams.value &&
          JSON.stringify(previousParams.value) === JSON.stringify(currentParams)) {
        return
      }

      try {
        isLoading.value = true
        error.value = null
        previousParams.value = currentParams

        const response = await apiService.get('/movies', { params: currentParams })
        store.commit('movie/setMovies', response.data.content)
        store.commit('movie/SET_TOTAL_PAGES', response.data.totalPages)
      } catch (err) {
        console.error('Error fetching movies:', err)
        error.value = '載入電影列表失敗'
        await Swal.fire('錯誤', '載入電影列表失敗', 'error')
      } finally {
        isLoading.value = false
      }
    }
    const handleSearch = () => {
      currentPage.value = 1
      debouncedSearch()
    }

    const filterMovies = () => {
      currentPage.value = 1
      fetchMovies()
    }

    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        fetchMovies()
      }
    }

    const openMovieModal = (movie = null) => {
      if (movie) {
        editingMovie.value = {
          ...movie,
          release_date: formatDateForInput(movie.release_date),
          end_date: formatDateForInput(movie.end_date)
        }
      } else {
        editingMovie.value = {
          title: '',
          release_date: '',
          end_date: '',
          duration: '',
          description: '',
          director: '',
          genre: '',
          price: 0,
          is_showing: true,
          poster_url: ''
        }
      }
      modalInstance.value = new Modal(movieModal.value)
      modalInstance.value.show()
    }

    const closeModal = () => {
      if (modalInstance.value) {
        modalInstance.value.hide()
      }
    }

    const handleImageUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        editingMovie.value.posterFile = file
        editingMovie.value.posterUrl = URL.createObjectURL(file)
      }
    }

    const saveMovie = async () => {
      try {
        isProcessing.value = true

        // 驗證必要欄位
        const requiredFields = ['title', 'director', 'release_date', 'end_date', 'duration', 'genre']
        const missingFields = requiredFields.filter(field => !editingMovie.value[field])

        if (missingFields.length > 0) {
          throw new Error(`請填寫以下必要欄位: ${missingFields.join(', ')}`)
        }

        // 驗證票價
        const price = parseInt(editingMovie.value.price)
        if (price < 0) {
          throw new Error('票價不能小於0')
        }

        // 驗證日期
        const releaseDate = new Date(editingMovie.value.release_date)
        const endDate = new Date(editingMovie.value.end_date)
        if (endDate < releaseDate) {
          throw new Error('下檔日期不能早於上映日期')
        }

        const movieData = {
          title: editingMovie.value.title?.trim(),
          description: editingMovie.value.description?.trim(),
          director: editingMovie.value.director?.trim(),
          cast: editingMovie.value.cast?.trim(),
          duration: parseInt(editingMovie.value.duration),
          genre: editingMovie.value.genre?.trim(),
          rating: editingMovie.value.rating || 'G',
          price: price,
          releaseDate: releaseDate.toISOString(),
          endDate: endDate.toISOString(),
          isShowing: Boolean(editingMovie.value.isShowing)
        }

        let response
        if (editingMovie.value.posterFile) {
          const formData = new FormData()
          Object.entries(movieData).forEach(([key, value]) => {
            if (value != null) {
              formData.append(key, value.toString())
            }
          })
          formData.append('poster', editingMovie.value.posterFile)

          if (editingMovie.value.id) {
            response = await apiService.put(
                `/movies/${editingMovie.value.id}`,
                formData,
                {
                  headers: {
                    'Content-Type': 'multipart/form-data'
                  }
                }
            )
          } else {
            response = await apiService.post(
                '/movies',
                formData,
                {
                  headers: {
                    'Content-Type': 'multipart/form-data'
                  }
                }
            )
          }
        } else {
          if (editingMovie.value.id) {
            response = await apiService.put(
                `/movies/${editingMovie.value.id}`,
                movieData,
                {
                  headers: {
                    'Content-Type': 'application/json'
                  }
                }
            )
          } else {
            response = await apiService.post(
                '/movies',
                movieData,
                {
                  headers: {
                    'Content-Type': 'application/json'
                  }
                }
            )
          }
        }

        if (response?.data) {
          await Swal.fire(
              '成功',
              editingMovie.value.id ? '電影資料已更新' : '已新增電影',
              'success'
          )
          await fetchMovies()
          closeModal()
        }
      } catch (err) {
        console.error('Error saving movie:', err)
        const errorMessage = err.message || err.response?.data?.message || '儲存電影資料失敗'
        await Swal.fire('錯誤', errorMessage, 'error')
      } finally {
        isProcessing.value = false
      }
    }

    const confirmDelete = (movie) => {
      Swal.fire({
        title: '確定要刪除嗎？',
        text: `即將刪除電影「${movie.title}」`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '確定刪除',
        cancelButtonText: '取消'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await apiService.delete(`/movies/${movie.id}`)
            await fetchMovies()
            await Swal.fire('已刪除', '電影已成功刪除', 'success')
          } catch (err) {
            console.error('Error deleting movie:', err)
            await Swal.fire('錯誤', '刪除電影失敗', 'error')
          }
        }
      })
    }

    const getStatusClass = (isShowing) => {
      return isShowing ? 'bg-success' : 'bg-secondary'
    }

    const getStatusText = (isShowing) => {
      return isShowing ? '上映中' : '未上映'
    }

    const formatDateForInput = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toISOString().split('T')[0]
    }

    const formatDate = (date) => {
      if (!date) return '未設定'
      return new Date(date).toLocaleDateString('zh-TW')
    }

    onMounted(() => {
      fetchMovies()
    })

    return {
      isLoading,
      error,
      isProcessing,
      movies,
      searchKeyword,
      selectedStatus,
      currentPage,
      totalPages,
      displayedPages,
      editingMovie,
      movieModal,
      handleSearch,
      filterMovies,
      changePage,
      openMovieModal,
      handleImageUpload,
      saveMovie,
      confirmDelete,
      getStatusClass,
      getStatusText,
      formatDate,
      goBack,
      formatDateForInput,
      closeModal
    }
  }
}

</script>
<style scoped>
.movie-management {
  padding: 2rem 0;
  min-height: 100vh;
  background-color: var(--bg-color-light);
}

.movie-poster {
  width: 60px;
  height: 90px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.badge {
  padding: 0.5rem 0.75rem;
  font-weight: 500;
  border-radius: 4px;
}

.table {
  background-color: white;
  border-radius: 8px;
  box-shadow: var(--box-shadow);
}

.table th {
  font-weight: 600;
  white-space: nowrap;
  background-color: var(--bg-color-light);
}

.table td {
  vertical-align: middle;
}

.modal-body {
  max-height: calc(100vh - 210px);
  overflow-y: auto;
}

.filters {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: var(--box-shadow);
}

.pagination {
  margin-bottom: 2rem;
}

.pagination .page-link {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.pagination .active .page-link {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

@media (max-width: 768px) {
  .movie-management {
    padding: 1rem 0;
  }

  .filters .row {
    row-gap: 1rem;
  }

  .movie-poster {
    width: 45px;
    height: 68px;
  }

  .table {
    font-size: 0.875rem;
  }

  .badge {
    padding: 0.35rem 0.5rem;
    font-size: 0.75rem;
  }
}
.preview-poster {
  max-width: 200px;
  max-height: 300px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table th {
  white-space: nowrap;
}

.table td {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 在小螢幕設備上的表格處理 */
@media (max-width: 768px) {
  .table-responsive {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  /* 調整表格內容在小螢幕的顯示 */
  .table td, .table th {
    padding: 0.5rem;
    font-size: 0.875rem;
  }

  /* 海報圖片在小螢幕的大小 */
  .movie-poster {
    width: 40px;
    height: 60px;
  }
}

/* 更小的螢幕尺寸 */
@media (max-width: 576px) {
  /* 搜尋和篩選區塊在小螢幕上改為單欄 */
  .filters .col-md-4,
  .filters .col-md-3 {
    width: 100%;
    margin-bottom: 1rem;
  }

  /* 調整按鈕和標題的排列 */
  .management-content .d-flex {
    flex-direction: column;
    gap: 1rem;
  }

  .management-content .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
@media (max-width: 768px) {
  .modal-dialog {
    margin: 0.5rem;
  }

  .modal-body {
    padding: 1rem;
  }

  /* Modal 中的表單元素 */
  .modal-body .row {
    margin: 0;
  }

  .modal-body .col-md-6,
  .modal-body .col-md-4 {
    padding: 0.5rem;
  }
}
@media (max-width: 576px) {
  .pagination {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.25rem;
  }

  .pagination .page-link {
    padding: 0.375rem 0.75rem;
  }
}
</style>
