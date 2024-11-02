<template>
  <div class="movie-card" @click.stop="handleClick">
    <!-- 電影海報 -->
    <div class="movie-poster">
      <img
          :src="movie.posterUrl || require('@/assets/images/default-poster.jpg')"
          :alt="movie.title"
          class="poster-image"
      >
      <div class="movie-overlay">
        <div class="movie-rating" v-if="movie.rating">
          <i class="fas fa-star"></i>
          {{ movie.rating.toFixed(1) }}
        </div>
        <div class="movie-duration" v-if="movie.duration">
          <i class="fas fa-clock"></i>
          {{ movie.duration }} 分鐘
        </div>
      </div>
    </div>

    <!-- 電影資訊 -->
    <div class="movie-info">
      <h5 class="movie-title">{{ movie.title }}</h5>

      <div class="movie-meta">
        <span class="movie-category" v-if="movie.category">
          <i class="fas fa-film"></i>
          {{ movie.category }}
        </span>

        <span class="movie-status" v-if="movie.status">
          <i class="fas fa-calendar"></i>
          {{ getStatusText(movie.status) }}
        </span>
      </div>

      <div class="movie-actions">
        <span class="movie-price" v-if="movie.price">
          <i class="fas fa-ticket-alt"></i>
          NT$ {{ movie.price }}
        </span>

        <button
            class="btn btn-primary btn-sm book-btn"
            :disabled="!canBook"
            @click.stop="handleBooking"
        >
          <i class="fas fa-bookmark"></i>
          立即訂票
        </button>

        <button
            v-if="showTrailer"
            class="btn btn-outline-primary btn-sm trailer-btn"
            @click.stop="openTrailer"
        >
          <i class="fas fa-play"></i>
          預告片
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
            <h5 class="modal-title">{{ movie.title }} - 預告片</h5>
            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <iframe
                v-if="movie.trailerUrl"
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'

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

    // 計算屬性
    const canBook = computed(() => {
      return props.movie.status === 'SHOWING' && props.movie.price > 0
    })

    const showTrailer = computed(() => {
      return props.movie.trailerUrl && props.movie.trailerUrl.length > 0
    })

    // 方法
    const handleClick = () => {
      router.push({
        name: 'movie-detail',
        params: { id: props.movie.id }
      })
    }

    const handleBooking = () => {
      if (canBook.value) {
        router.push({
          name: 'booking',
          params: { movieId: props.movie.id }
        })
      }
    }

    const openTrailer = () => {
      const modal = new Modal(trailerModal.value)
      modal.show()
    }

    const getStatusText = (status) => {
      switch (status) {
      case 'SHOWING':
        return '上映中'
      case 'COMING':
        return '即將上映'
      default:
        return '未知'
      }
    }

    return {
      trailerModal,
      canBook,
      showTrailer,
      handleClick,
      handleBooking,
      openTrailer,
      getStatusText
    }
  }
}
</script>

<style scoped>
.movie-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.movie-card:hover {
  transform: translateY(-5px);
}

.movie-poster {
  position: relative;
  padding-top: 150%;
}

.poster-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%);
  color: white;
  display: flex;
  justify-content: space-between;
}

.movie-rating,
.movie-duration {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.movie-info {
  padding: 1rem;
}

.movie-title {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.movie-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.movie-category,
.movie-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.movie-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
}

.movie-price {
  font-weight: 600;
  color: var(--primary-color);
}

.book-btn,
.trailer-btn {
  padding: 0.25rem 0.75rem;
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

@media (max-width: 768px) {
  .movie-title {
    font-size: 0.875rem;
  }

  .movie-meta {
    font-size: 0.75rem;
  }

  .book-btn,
  .trailer-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
}
</style>
