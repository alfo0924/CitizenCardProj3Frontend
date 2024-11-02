<template>
  <div class="movie-detail-container">
    <!-- 載入中狀態 -->
    <LoadingSpinner v-if="isLoading" />

    <!-- 錯誤提示 -->
    <AlertMessage
        v-if="error"
        type="error"
        :message="error"
    />

    <!-- 電影詳情 -->
    <div v-else-if="movie" class="movie-content">
      <!-- 電影基本信息 -->
      <div class="movie-header">
        <div class="row">
          <!-- 電影海報 -->
          <div class="col-md-4">
            <div class="movie-poster">
              <img
                  :src="movie.posterUrl || require('@/assets/images/default-poster.jpg')"
                  :alt="movie.movieName"
                  class="img-fluid rounded"
              >
            </div>
          </div>

          <!-- 電影信息 -->
          <div class="col-md-8">
            <div class="movie-info">
              <h1 class="movie-title">{{ movie.movieName }}</h1>

              <!-- 評分和類別 -->
              <div class="movie-meta mb-3">
                <span class="rating" v-if="movie.rating">
                  <i class="fas fa-star text-warning"></i>
                  {{ movie.rating }}
                </span>
                <span class="duration">
                  <i class="fas fa-clock"></i>
                  {{ formatDuration(movie.duration) }}
                </span>
                <span class="category" v-if="movie.categoryName">
                  <i class="fas fa-film"></i>
                  {{ movie.categoryName }}
                </span>
              </div>

              <!-- 狀態標籤 -->
              <div class="movie-status mb-3">
                <span
                    class="badge"
                    :class="statusClass"
                >
                  {{ movie.status }}
                </span>
              </div>

              <!-- 上映日期 -->
              <div class="release-date mb-3">
                <strong>上映日期：</strong>
                {{ formatDate(movie.releaseDate) }}
              </div>

              <!-- 電影簡介 -->
              <div class="movie-description mb-4">
                <h5>劇情簡介</h5>
                <p>{{ movie.description }}</p>
              </div>

              <!-- 操作按鈕 -->
              <div class="movie-actions">
                <button
                    class="btn btn-primary btn-lg me-3"
                    @click="goToBooking"
                    :disabled="!isBookable"
                >
                  <i class="fas fa-ticket-alt me-2"></i>
                  立即訂票
                </button>
                <button
                    v-if="movie.trailerUrl"
                    class="btn btn-outline-primary btn-lg"
                    @click="showTrailer"
                >
                  <i class="fas fa-play me-2"></i>
                  觀看預告片
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 場次信息 -->
      <div class="movie-schedule mt-5">
        <h2 class="section-title mb-4">放映場次</h2>

        <!-- 日期選擇 -->
        <div class="date-selector mb-4">
          <div class="btn-group">
            <button
                v-for="date in availableDates"
                :key="date"
                class="btn"
                :class="[selectedDate === date ? 'btn-primary' : 'btn-outline-primary']"
                @click="selectDate(date)"
            >
              {{ formatDateShort(date) }}
            </button>
          </div>
        </div>

        <!-- 場次列表 -->
        <div class="schedule-list" v-if="filteredSchedules.length">
          <div class="row row-cols-1 row-cols-md-3 g-4">
            <div
                v-for="schedule in filteredSchedules"
                :key="schedule.scheduleId"
                class="col"
            >
              <div class="schedule-card">
                <div class="schedule-time">
                  {{ formatTime(schedule.showTime) }}
                </div>
                <div class="schedule-venue">
                  {{ schedule.venueName }}
                </div>
                <div class="schedule-seats">
                  剩餘座位：{{ schedule.availableSeats }}
                </div>
                <button
                    class="btn btn-primary w-100"
                    @click="selectSchedule(schedule)"
                    :disabled="!schedule.availableSeats"
                >
                  選擇場次
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-4">
          <p class="text-muted">該日期無可用場次</p>
        </div>
      </div>

      <!-- 評論區 -->
      <div class="movie-reviews mt-5">
        <h2 class="section-title mb-4">觀眾評論</h2>

        <!-- 評論列表 -->
        <div class="review-list" v-if="reviews.length">
          <div
              v-for="review in reviews"
              :key="review.reviewId"
              class="review-item"
          >
            <div class="review-header">
              <div class="review-user">
                <img
                    :src="review.userAvatar || require('@/assets/images/default-avatar.jpg')"
                    :alt="review.userName"
                    class="user-avatar"
                >
                <span class="user-name">{{ review.userName }}</span>
              </div>
              <div class="review-rating">
                <i
                    v-for="n in 5"
                    :key="n"
                    class="fas fa-star"
                    :class="{ 'text-warning': n <= review.rating }"
                ></i>
              </div>
            </div>
            <div class="review-content">
              {{ review.comment }}
            </div>
            <div class="review-footer">
              <small class="text-muted">
                {{ formatDateTime(review.reviewTime) }}
              </small>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-4">
          <p class="text-muted">暫無評論</p>
        </div>

        <!-- 新增評論 -->
        <div class="add-review mt-4" v-if="isLoggedIn">
          <h5>新增評論</h5>
          <div class="rating-input mb-3">
            <i
                v-for="n in 5"
                :key="n"
                class="fas fa-star"
                :class="{ 'text-warning': n <= newReview.rating }"
                @click="setRating(n)"
                style="cursor: pointer"
            ></i>
          </div>
          <div class="form-group mb-3">
            <textarea
                class="form-control"
                v-model="newReview.comment"
                rows="3"
                placeholder="分享您的觀影心得..."
            ></textarea>
          </div>
          <button
              class="btn btn-primary"
              @click="submitReview"
              :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
            {{ isSubmitting ? '提交中...' : '提交評論' }}
          </button>
        </div>
        <div v-else class="text-center mt-4">
          <p class="text-muted">
            請 <router-link to="/login">登入</router-link> 後發表評論
          </p>
        </div>
      </div>
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
            <h5 class="modal-title">{{ movie?.movieName }} - 預告片</h5>
            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <div class="ratio ratio-16x9">
              <iframe
                  :src="movie?.trailerUrl"
                  allowfullscreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { Modal } from 'bootstrap'

import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'

export default {
  name: 'MovieDetail',

  components: {
    LoadingSpinner,
    AlertMessage
  },

  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const trailerModal = ref(null)

    // 狀態
    const isLoading = ref(false)
    const error = ref(null)
    const selectedDate = ref(new Date().toISOString().split('T')[0])
    const isSubmitting = ref(false)

    // 新評論
    const newReview = ref({
      rating: 0,
      comment: ''
    })

    // 從store獲取數據
    const movie = computed(() => store.state.movie.currentMovie)
    const schedules = computed(() => store.state.movie.schedules)
    const reviews = computed(() => store.state.movie.reviews)
    const isLoggedIn = computed(() => store.getters['auth/isLoggedIn'])

    // 計算可訂票狀態
    const isBookable = computed(() => {
      return movie.value?.status === 'SHOWING' &&
          new Date(movie.value?.releaseDate) <= new Date()
    })

    // 計算狀態樣式
    const statusClass = computed(() => {
      switch (movie.value?.status) {
        case 'SHOWING':
          return 'bg-success'
        case 'COMING':
          return 'bg-primary'
        case 'ENDED':
          return 'bg-secondary'
        default:
          return 'bg-secondary'
      }
    })

    // 可選日期列表
    const availableDates = computed(() => {
      const dates = new Set(schedules.value.map((s) =>
          s.showTime.split('T')[0]
      ))
      return Array.from(dates).sort()
    })

    // 過濾當前選擇日期的場次
    const filteredSchedules = computed(() => {
      return schedules.value.filter((s) =>
          s.showTime.startsWith(selectedDate.value)
      )
    })

    // 獲取電影詳情
    const fetchMovieDetail = async () => {
      try {
        isLoading.value = true
        error.value = null
        const movieId = route.params.id
        await Promise.all([
          store.dispatch('movie/fetchMovieDetail', movieId),
          store.dispatch('movie/fetchMovieSchedules', movieId),
          store.dispatch('movie/fetchMovieReviews', movieId)
        ])
      } catch (err) {
        error.value = '載入電影詳情失敗，請稍後再試'
        console.error('Error fetching movie detail:', err)
      } finally {
        isLoading.value = false
      }
    }

    // 選擇日期
    const selectDate = (date) => {
      selectedDate.value = date
    }

    // 選擇場次
    const selectSchedule = (schedule) => {
      if (!isLoggedIn.value) {
        router.push('/login')
        return
      }
      router.push(`/booking/${schedule.scheduleId}`)
    }

    // 前往訂票
    const goToBooking = () => {
      if (!isLoggedIn.value) {
        router.push('/login')
        return
      }
      router.push(`/movies/${movie.value.movieId}/booking`)
    }

    // 顯示預告片
    const showTrailer = () => {
      const modal = new Modal(trailerModal.value)
      modal.show()
    }

    // 設置評分
    const setRating = (rating) => {
      newReview.value.rating = rating
    }

    // 提交評論
    const submitReview = async () => {
      if (!newReview.value.rating || !newReview.value.comment.trim()) {
        return
      }

      try {
        isSubmitting.value = true
        await store.dispatch('movie/submitReview', {
          movieId: movie.value.movieId,
          ...newReview.value
        })
        newReview.value = { rating: 0, comment: '' }
        await store.dispatch('movie/fetchMovieReviews', movie.value.movieId)
      } catch (err) {
        console.error('Error submitting review:', err)
      } finally {
        isSubmitting.value = false
      }
    }

    // 格式化方法
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-TW')
    }

    const formatDateShort = (date) => {
      return new Date(date).toLocaleDateString('zh-TW', {
        month: 'numeric',
        day: 'numeric',
        weekday: 'short'
      })
    }

    const formatTime = (datetime) => {
      return new Date(datetime).toLocaleTimeString('zh-TW', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatDateTime = (datetime) => {
      return new Date(datetime).toLocaleString('zh-TW')
    }

    const formatDuration = (minutes) => {
      if (!minutes) return '未知'
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours}小時${mins}分鐘`
    }

    // 生命週期鉤子
    onMounted(() => {
      fetchMovieDetail()
    })

    return {
      isLoading,
      error,
      movie,
      schedules,
      reviews,
      selectedDate,
      isSubmitting,
      newReview,
      isLoggedIn,
      isBookable,
      statusClass,
      availableDates,
      filteredSchedules,
      trailerModal,
      selectDate,
      selectSchedule,
      goToBooking,
      showTrailer,
      setRating,
      submitReview,
      formatDate,
      formatDateShort,
      formatTime,
      formatDateTime,
      formatDuration
    }
  }
}
</script>

<style scoped>
.movie-detail-container {
  padding: 2rem 0;
}

.movie-header {
  background-color: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
}

.movie-poster {
  position: relative;
  width: 100%;
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.movie-poster img {
  width: 100%;
  height: auto;
  transition: transform 0.3s ease;
}

.movie-poster:hover img {
  transform: scale(1.05);
}

.movie-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.movie-meta {
  display: flex;
  gap: 1.5rem;
  color: var(--text-secondary);
}

.movie-meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.movie-status .badge {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

.movie-description {
  color: var(--text-secondary);
  line-height: 1.6;
}

.movie-actions {
  margin-top: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.date-selector {
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: 1rem;
}

.date-selector .btn-group {
  display: inline-flex;
}

.date-selector .btn {
  min-width: 120px;
}

.schedule-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  transition: transform 0.3s ease;
}

.schedule-card:hover {
  transform: translateY(-5px);
}

.schedule-time {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.schedule-venue {
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.schedule-seats {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.review-item {
  background-color: white;
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  margin-bottom: 1rem;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.review-rating {
  color: var(--text-light);
}

.review-content {
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.rating-input {
  font-size: 1.5rem;
}

.rating-input i {
  margin-right: 0.25rem;
}

.rating-input i:hover {
  color: var(--warning-color);
}

@media (max-width: 768px) {
  .movie-header {
    padding: 1rem;
  }

  .movie-title {
    font-size: 1.5rem;
  }

  .movie-meta {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .movie-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .movie-actions .btn {
    width: 100%;
  }

  .schedule-card {
    margin-bottom: 1rem;
  }
}
</style>