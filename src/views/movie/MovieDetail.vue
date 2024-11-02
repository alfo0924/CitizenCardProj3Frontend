<template>
  <div class="movie-detail">
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

    <!-- 電影詳情 -->
    <div v-else-if="movie" class="movie-content">
      <!-- 電影基本資訊 -->
      <div class="movie-header">
        <div class="container">
          <div class="row">
            <div class="col-md-4">
              <div class="movie-poster">
                <img
                    :src="movie.posterUrl || require('@/assets/images/default-poster.jpg')"
                    :alt="movie.title"
                    class="poster-image"
                >
              </div>
            </div>
            <div class="col-md-8">
              <div class="movie-info">
                <h1 class="movie-title">{{ movie.title }}</h1>

                <div class="movie-meta">
                  <span class="movie-rating" v-if="movie.rating">
                    <i class="fas fa-star"></i>
                    {{ movie.rating.toFixed(1) }}
                  </span>
                  <span class="movie-duration" v-if="movie.duration">
                    <i class="fas fa-clock"></i>
                    {{ movie.duration }} 分鐘
                  </span>
                  <span class="movie-category" v-if="movie.category">
                    <i class="fas fa-film"></i>
                    {{ movie.category }}
                  </span>
                  <span class="movie-release-date" v-if="movie.releaseDate">
                    <i class="fas fa-calendar"></i>
                    {{ formatDate(movie.releaseDate) }}
                  </span>
                </div>

                <div class="movie-description">
                  {{ movie.description }}
                </div>

                <div class="movie-actions">
                  <button
                      v-if="movie.trailerUrl"
                      class="btn btn-outline-primary me-2"
                      @click="openTrailer"
                  >
                    <i class="fas fa-play"></i>
                    觀看預告片
                  </button>
                  <button
                      class="btn btn-primary"
                      :disabled="!canBook"
                      @click="handleBooking"
                  >
                    <i class="fas fa-ticket-alt"></i>
                    立即訂票
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 場次資訊 -->
      <div class="movie-schedules">
        <div class="container">
          <h2>放映場次</h2>
          <div v-if="schedules.length > 0" class="schedule-list">
            <div
                v-for="schedule in schedules"
                :key="schedule.id"
                class="schedule-item"
            >
              <div class="schedule-time">
                {{ formatDateTime(schedule.startTime) }}
              </div>
              <div class="schedule-info">
                <span class="schedule-theater">{{ schedule.theater }}</span>
                <span class="schedule-seats">
                  剩餘座位：{{ schedule.availableSeats }}
                </span>
              </div>
              <button
                  class="btn btn-primary btn-sm"
                  :disabled="!schedule.availableSeats"
                  @click="handleScheduleSelect(schedule)"
              >
                選擇
              </button>
            </div>
          </div>
          <div v-else class="no-schedules">
            暫無場次資訊
          </div>
        </div>
      </div>

      <!-- 評論區域 -->
      <div class="movie-reviews">
        <div class="container">
          <h2>觀眾評論</h2>
          <div v-if="reviews.length > 0" class="review-list">
            <div
                v-for="review in reviews"
                :key="review.id"
                class="review-item"
            >
              <div class="review-header">
                <span class="review-author">{{ review.author }}</span>
                <span class="review-rating">
                  <i class="fas fa-star"></i>
                  {{ review.rating }}
                </span>
                <span class="review-date">
                  {{ formatDateTime(review.createdAt) }}
                </span>
              </div>
              <div class="review-content">
                {{ review.comment }}
              </div>
            </div>
          </div>
          <div v-else class="no-reviews">
            暫無評論
          </div>
        </div>
      </div>
    </div>

    <!-- 無數據提示 -->
    <div v-else class="no-data">
      找不到電影資料
    </div>

    <!-- 預告片Modal -->
    <div
        class="modal fade"
        id="trailerModal"
        tabindex="-1"
        ref="trailerModal"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ movie?.title }} - 預告片</h5>
            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <iframe
                v-if="movie?.trailerUrl"
                :src="movie.trailerUrl"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { Modal } from 'bootstrap'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

export default {
  name: 'MovieDetail',

  components: {
    LoadingSpinner
  },

  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const trailerModal = ref(null)

    // 從store獲取數據
    const movie = computed(() => store.state.movie.currentMovie)
    const schedules = computed(() => store.state.movie.schedules)
    const reviews = computed(() => store.state.movie.reviews)
    const isLoading = computed(() => store.state.movie.isLoading)
    const error = computed(() => store.state.movie.error)

    // 計算屬性
    const canBook = computed(() => {
      return movie.value?.status === 'SHOWING' && schedules.value?.length > 0
    })

    // 獲取電影詳情
    const fetchMovieDetail = async () => {
      const movieId = route.params.id
      if (movieId) {
        await store.dispatch('movie/fetchMovieDetail', movieId)
        await store.dispatch('movie/fetchMovieSchedules', movieId)
        await store.dispatch('movie/fetchMovieReviews', movieId)
      }
    }

    // 處理訂票
    const handleBooking = () => {
      if (canBook.value) {
        router.push({
          name: 'booking',
          params: { movieId: movie.value.id }
        })
      }
    }

    // 選擇場次
    const handleScheduleSelect = (schedule) => {
      router.push({
        name: 'booking',
        params: { scheduleId: schedule.id }
      })
    }

    // 開啟預告片
    const openTrailer = () => {
      const modal = new Modal(trailerModal.value)
      modal.show()
    }

    // 格式化日期
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-TW')
    }

    // 格式化日期時間
    const formatDateTime = (datetime) => {
      return new Date(datetime).toLocaleString('zh-TW')
    }

    // 清理函數
    const cleanup = () => {
      store.dispatch('movie/clearMovieData')
    }

    onMounted(() => {
      fetchMovieDetail()
    })

    onUnmounted(() => {
      cleanup()
    })

    return {
      movie,
      schedules,
      reviews,
      isLoading,
      error,
      trailerModal,
      canBook,
      handleBooking,
      handleScheduleSelect,
      openTrailer,
      formatDate,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.movie-detail {
  padding-bottom: 2rem;
}

.movie-header {
  background: var(--bg-dark);
  color: white;
  padding: 2rem 0;
  margin-bottom: 2rem;
}

.movie-poster {
  position: relative;
  padding-top: 150%;
  border-radius: 8px;
  overflow: hidden;
}

.poster-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-info {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.movie-title {
  margin-bottom: 1rem;
  font-size: 2rem;
  font-weight: 600;
}

.movie-meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.movie-meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.movie-description {
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.movie-actions {
  margin-top: auto;
}

.movie-schedules,
.movie-reviews {
  padding: 2rem 0;
}

.schedule-list,
.review-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.schedule-item,
.review-item {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.schedule-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.schedule-time {
  font-size: 1.1rem;
  font-weight: 600;
}

.schedule-info {
  display: flex;
  gap: 1rem;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.review-author {
  font-weight: 600;
}

.review-rating {
  color: var(--warning-color);
}

.review-date {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.modal-body {
  padding: 0;
  background: black;
}

.modal-body iframe {
  width: 100%;
  aspect-ratio: 16 / 9;
}

.loading,
.error,
.no-data,
.no-schedules,
.no-reviews {
  text-align: center;
  padding: 2rem;
}

@media (max-width: 768px) {
  .movie-title {
    font-size: 1.5rem;
  }

  .movie-meta {
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.875rem;
  }

  .schedule-item {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
