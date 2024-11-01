<template>
  <div class="movie-card" @click="goToDetail">
    <!-- 電影海報 -->
    <div class="movie-poster">
      <img
          :src="movie.posterUrl || require('@/assets/images/default-poster.jpg')"
          :alt="movie.movieName"
          class="poster-image"
      >
      <div class="movie-status" :class="statusClass">
        {{ movie.status }}
      </div>
    </div>

    <!-- 電影資訊 -->
    <div class="movie-info">
      <h5 class="movie-title">{{ movie.movieName }}</h5>

      <div class="movie-meta">
        <span class="duration">
          <i class="fas fa-clock"></i> {{ formatDuration(movie.duration) }}
        </span>
        <span class="rating" v-if="movie.rating">
          <i class="fas fa-star"></i> {{ movie.rating }}
        </span>
      </div>

      <div class="movie-category" v-if="movie.categoryName">
        <span class="badge bg-secondary">{{ movie.categoryName }}</span>
      </div>

      <!-- 上映日期 -->
      <div class="release-date">
        <i class="fas fa-calendar-alt"></i>
        {{ formatDate(movie.releaseDate) }}
      </div>

      <!-- 簡短描述 -->
      <p class="movie-description" v-if="movie.description">
        {{ truncateDescription(movie.description) }}
      </p>

      <!-- 操作按鈕 -->
      <div class="movie-actions">
        <button
            class="btn btn-primary btn-sm"
            @click.stop="goToBooking"
            :disabled="!isBookable"
        >
          <i class="fas fa-ticket-alt"></i> 立即訂票
        </button>
        <button
            class="btn btn-outline-secondary btn-sm"
            @click.stop="showTrailer"
            v-if="movie.trailerUrl"
        >
          <i class="fas fa-play"></i> 預告片
        </button>
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
            <h5 class="modal-title">{{ movie.movieName }} - 預告片</h5>
            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <div class="ratio ratio-16x9">
              <iframe
                  :src="movie.trailerUrl"
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
import { Modal } from 'bootstrap'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'MovieCard',

  props: {
    movie: {
      type: Object,
      required: true
    }
  },

  setup(props) {
    const router = useRouter()
    const trailerModal = ref(null)

    // 計算電影是否可訂票
    const isBookable = computed(() => {
      return props.movie.status === '熱映中' &&
          new Date(props.movie.releaseDate) <= new Date()
    })

    // 計算狀態樣式
    const statusClass = computed(() => {
      return {
        'status-showing': props.movie.status === '熱映中',
        'status-coming': props.movie.status === '即將上映',
        'status-ended': props.movie.status === '已下檔'
      }
    })

    // 格式化時間長度
    const formatDuration = (minutes) => {
      if (!minutes) return '未知'
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return `${hours}小時${mins}分鐘`
    }

    // 格式化日期
    const formatDate = (date) => {
      if (!date) return '未知'
      return new Date(date).toLocaleDateString('zh-TW')
    }

    // 截短描述文字
    const truncateDescription = (text) => {
      if (!text) return ''
      return text.length > 50 ? text.substring(0, 50) + '...' : text
    }

    // 前往電影詳情頁
    const goToDetail = () => {
      router.push(`/movies/${props.movie.movieId}`)
    }

    // 前往訂票頁面
    const goToBooking = () => {
      if (isBookable.value) {
        router.push(`/movies/${props.movie.movieId}/booking`)
      }
    }

    // 顯示預告片
    const showTrailer = () => {
      if (props.movie.trailerUrl) {
        const modal = new Modal(trailerModal.value)
        modal.show()
      }
    }

    return {
      isBookable,
      statusClass,
      formatDuration,
      formatDate,
      truncateDescription,
      goToDetail,
      goToBooking,
      showTrailer,
      trailerModal
    }
  }
}
</script>

<style scoped>
.movie-card {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  transition: transform 0.3s ease;
  cursor: pointer;
  overflow: hidden;
}

.movie-card:hover {
  transform: translateY(-5px);
}

.movie-poster {
  position: relative;
  width: 100%;
  padding-top: 150%; /* 2:3 aspect ratio */
}

.poster-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: var(--border-radius-sm);
  color: white;
  font-size: 0.875rem;
}

.status-showing {
  background-color: var(--success-color);
}

.status-coming {
  background-color: var(--primary-color);
}

.status-ended {
  background-color: var(--secondary-color);
}

.movie-info {
  padding: 1rem;
}

.movie-title {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  font-weight: 500;
}

.movie-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  color: var(--text-light);
  font-size: 0.875rem;
}

.movie-category {
  margin-bottom: 0.5rem;
}

.release-date {
  color: var(--text-light);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.movie-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.4;
}

.movie-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  flex: 1;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .movie-card {
    max-width: 300px;
    margin: 0 auto;
  }
}
</style>