<template>
  <div class="promotion-card">
    <div class="card h-100">
      <!-- 活動圖片 -->
      <div class="promotion-image">
        <img
            :src="promotion.imageUrl || require('@/assets/images/default-promotion.jpg')"
            :alt="promotion.title"
            class="card-img-top"
            @error="handleImageError"
        >
        <span :class="['status-badge', getStatusClass]">
          {{ getStatusText }}
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
        <div class="promotion-time mb-2">
          <i class="bi bi-calendar3"></i>
          <span>{{ formatDate(promotion.startDate) }} - {{ formatDate(promotion.endDate) }}</span>
        </div>

        <!-- 參與統計 -->
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
              class="btn btn-primary btn-sm"
          >
            查看詳情
          </router-link>
          <button
              class="btn btn-outline-primary btn-sm"
              @click.stop="toggleFavorite"
              :disabled="promotion.status === 'ended'"
          >
            <i :class="['bi', isFavorite ? 'bi-heart-fill' : 'bi-heart']"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default {
  name: 'PromotionCard',

  props: {
    promotion: {
      type: Object,
      required: true,
      validator: (promotion) => {
        return promotion.id && promotion.title && promotion.startDate && promotion.endDate;
      }
    }
  },

  setup(props) {
    const router = useRouter()
    const store = useStore()
    const isFavorite = ref(props.promotion.isFavorite || false)

    const getStatusClass = computed(() => {
      const statusMap = {
        'ongoing': 'status-ongoing',
        'upcoming': 'status-upcoming',
        'ended': 'status-ended'
      }
      return statusMap[props.promotion.status] || 'status-default'
    })

    const getStatusText = computed(() => {
      const statusMap = {
        'ongoing': '進行中',
        'upcoming': '即將開始',
        'ended': '已結束'
      }
      return statusMap[props.promotion.status] || props.promotion.status
    })

    const toggleFavorite = async () => {
      if (!store.getters['auth/isLoggedIn']) {
        router.push({
          name: 'login',
          query: { redirect: router.currentRoute.value.fullPath }
        })
        return
      }

      try {
        await store.dispatch('promotion/toggleFavorite', {
          promotionId: props.promotion.id,
          isFavorite: !isFavorite.value
        })
        isFavorite.value = !isFavorite.value
      } catch (error) {
        console.error('Error toggling favorite:', error)
      }
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

    return {
      isFavorite,
      getStatusClass,
      getStatusText,
      toggleFavorite,
      formatDate,
      truncateText,
      handleImageError
    }
  }
}
</script>

<style scoped>
.promotion-card {
  height: 100%;
}

.card {
  transition: transform 0.2s ease;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card:hover {
  transform: translateY(-5px);
}

.promotion-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-img-top {
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

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.card-text {
  font-size: 0.875rem;
  line-height: 1.5;
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

@media (max-width: 768px) {
  .promotion-image {
    height: 150px;
  }
}
</style>
