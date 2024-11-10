<template>
  <div class="promotion-detail">
    <!-- 載入中提示 -->
    <loading-spinner v-if="loading" />

    <!-- 錯誤提示 -->
    <alert-message
        v-if="error"
        :message="error"
        type="danger"
        @close="error = ''"
    />

    <template v-if="!loading && !error && promotion">
      <!-- 活動頂部資訊 -->
      <div class="promotion-header bg-light py-4">
        <div class="container">
          <div class="row">
            <!-- 活動圖片 -->
            <div class="col-md-6">
              <div class="promotion-image-container">
                <img
                    :src="promotion.imageUrl || require('@/assets/images/default-promotion.jpg')"
                    :alt="promotion.title"
                    class="promotion-image"
                    @error="handleImageError"
                >
                <span :class="['status-badge', getStatusClass]">
                  {{ getStatusText }}
                </span>
              </div>
            </div>

            <!-- 活動基本資訊 -->
            <div class="col-md-6">
              <div class="promotion-info">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <h1 class="promotion-title">{{ promotion.title }}</h1>
                  <button
                      class="btn btn-outline-primary favorite-btn"
                      @click="toggleFavorite"
                      :disabled="promotion.status === 'ended'"
                  >
                    <i :class="['bi', isFavorite ? 'bi-heart-fill' : 'bi-heart']"></i>
                  </button>
                </div>

                <!-- 活動時間 -->
                <div class="promotion-time mb-3">
                  <i class="bi bi-calendar3"></i>
                  <span>{{ formatDate(promotion.startDate) }} - {{ formatDate(promotion.endDate) }}</span>
                </div>

                <!-- 活動地點 -->
                <div class="promotion-location mb-3" v-if="promotion.location">
                  <i class="bi bi-geo-alt"></i>
                  <span>{{ promotion.location }}</span>
                </div>

                <!-- 參與統計 -->
                <div class="promotion-stats mb-4">
                  <div class="stat-item">
                    <i class="bi bi-people"></i>
                    <span>{{ promotion.participantCount }} 人參與</span>
                  </div>
                  <div class="stat-item">
                    <i class="bi bi-heart"></i>
                    <span>{{ promotion.favoriteCount }} 人收藏</span>
                  </div>
                  <div class="stat-item">
                    <i class="bi bi-share"></i>
                    <span>{{ promotion.shareCount }} 次分享</span>
                  </div>
                </div>

                <!-- 活動標籤 -->
                <div class="promotion-tags mb-4">
                  <span
                      v-for="tag in promotion.tags"
                      :key="tag.id"
                      class="badge bg-secondary me-2"
                  >
                    {{ tag.name }}
                  </span>
                </div>

                <!-- 活動按鈕 -->
                <div class="action-buttons">
                  <button
                      class="btn btn-primary me-2"
                      @click="participate"
                      :disabled="!canParticipate"
                  >
                    {{ getParticipateButtonText }}
                  </button>
                  <button
                      class="btn btn-outline-primary me-2"
                      @click="sharePromotion"
                  >
                    <i class="bi bi-share"></i> 分享活動
                  </button>
                  <button
                      class="btn btn-outline-secondary"
                      @click="addToCalendar"
                      v-if="promotion.status !== 'ended'"
                  >
                    <i class="bi bi-calendar-plus"></i> 加入行事曆
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 活動詳細內容 -->
      <div class="container py-4">
        <div class="row">
          <div class="col-md-8">
            <!-- 活動說明 -->
            <section class="content-section">
              <h2 class="section-title">活動說明</h2>
              <div class="promotion-description" v-html="promotion.description"></div>
            </section>

            <!-- 活動規則 -->
            <section class="content-section" v-if="promotion.rules">
              <h2 class="section-title">活動規則</h2>
              <div class="promotion-rules" v-html="promotion.rules"></div>
            </section>

            <!-- 注意事項 -->
            <section class="content-section" v-if="promotion.notes">
              <h2 class="section-title">注意事項</h2>
              <div class="promotion-notes" v-html="promotion.notes"></div>
            </section>

            <!-- 相關商家 -->
            <section class="content-section" v-if="promotion.relatedStores?.length">
              <h2 class="section-title">參與商家</h2>
              <div class="row row-cols-1 row-cols-md-2 g-4">
                <div
                    v-for="store in promotion.relatedStores"
                    :key="store.id"
                    class="col"
                >
                  <store-card :store="store" />
                </div>
              </div>
            </section>
          </div>

          <!-- 側邊欄 -->
          <div class="col-md-4">
            <!-- 活動倒數計時 -->
            <div class="side-card mb-4" v-if="promotion.status !== 'ended'">
              <h3 class="card-title">
                {{ promotion.status === 'upcoming' ? '距離開始還有' : '距離結束還有' }}
              </h3>
              <div class="countdown">
                <div class="countdown-item">
                  <span class="number">{{ countdown.days }}</span>
                  <span class="label">天</span>
                </div>
                <div class="countdown-item">
                  <span class="number">{{ countdown.hours }}</span>
                  <span class="label">時</span>
                </div>
                <div class="countdown-item">
                  <span class="number">{{ countdown.minutes }}</span>
                  <span class="label">分</span>
                </div>
              </div>
            </div>

            <!-- 活動QR碼 -->
            <div class="side-card mb-4">
              <h3 class="card-title">活動QR碼</h3>
              <div class="qr-code">
                <img :src="promotion.qrCodeUrl" alt="QR Code">
              </div>
              <p class="text-muted text-center small mt-2">
                掃描QR碼快速分享活動
              </p>
            </div>

            <!-- 相關活動 -->
            <div class="side-card" v-if="relatedPromotions.length">
              <h3 class="card-title">相關活動</h3>
              <div class="related-promotions">
                <div
                    v-for="related in relatedPromotions"
                    :key="related.id"
                    class="related-promotion-item"
                >
                  <router-link
                      :to="{ name: 'promotion-detail', params: { id: related.id }}"
                      class="related-promotion-link"
                  >
                    <img
                        :src="related.imageUrl || require('@/assets/images/default-promotion.jpg')"
                        :alt="related.title"
                        class="related-promotion-image"
                    >
                    <div class="related-promotion-info">
                      <h4 class="related-promotion-title">{{ related.title }}</h4>
                      <p class="related-promotion-date">
                        {{ formatDate(related.startDate) }} - {{ formatDate(related.endDate) }}
                      </p>
                    </div>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'
import StoreCard from '@/components/store/StoreCard.vue'

export default {
  name: 'PromotionDetail',

  components: {
    LoadingSpinner,
    AlertMessage,
    StoreCard
  },

  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()

    // 響應式狀態
    const loading = ref(false)
    const error = ref('')
    const promotion = ref(null)
    const relatedPromotions = ref([])
    const isFavorite = ref(false)
    const countdown = ref({
      days: 0,
      hours: 0,
      minutes: 0
    })

    // 計算屬性
    const getStatusClass = computed(() => {
      const statusMap = {
        'ongoing': 'status-ongoing',
        'upcoming': 'status-upcoming',
        'ended': 'status-ended'
      }
      return statusMap[promotion.value?.status] || 'status-default'
    })

    const getStatusText = computed(() => {
      const statusMap = {
        'ongoing': '進行中',
        'upcoming': '即將開始',
        'ended': '已結束'
      }
      return statusMap[promotion.value?.status] || promotion.value?.status
    })

    const canParticipate = computed(() => {
      if (!promotion.value) return false
      return promotion.value.status === 'ongoing' &&
          store.getters['auth/isLoggedIn']
    })

    const getParticipateButtonText = computed(() => {
      if (!promotion.value) return ''
      if (promotion.value.status === 'ended') return '活動已結束'
      if (promotion.value.status === 'upcoming') return '尚未開始'
      if (promotion.value.hasParticipated) return '已參與'
      return '立即參與'
    })

    // 方法
    const fetchPromotionDetails = async () => {
      loading.value = true
      error.value = ''
      try {
        const response = await store.dispatch('promotion/fetchPromotionDetails', route.params.id)
        promotion.value = response.data
        isFavorite.value = promotion.value.isFavorite
        updateCountdown()
      } catch (err) {
        error.value = '載入活動資料失敗，請稍後再試'
        console.error('Error fetching promotion details:', err)
      } finally {
        loading.value = false
      }
    }

    const fetchRelatedPromotions = async () => {
      try {
        const response = await store.dispatch('promotion/fetchRelatedPromotions', route.params.id)
        relatedPromotions.value = response.data
      } catch (err) {
        console.error('Error fetching related promotions:', err)
      }
    }

    const toggleFavorite = async () => {
      if (!store.getters['auth/isLoggedIn']) {
        router.push({
          name: 'login',
          query: { redirect: route.fullPath }
        })
        return
      }

      try {
        await store.dispatch('promotion/toggleFavorite', {
          promotionId: promotion.value.id,
          isFavorite: !isFavorite.value
        })
        isFavorite.value = !isFavorite.value
        promotion.value.favoriteCount += isFavorite.value ? 1 : -1
      } catch (err) {
        error.value = '操作失敗，請稍後再試'
        console.error('Error toggling favorite:', err)
      }
    }

    const participate = async () => {
      if (!store.getters['auth/isLoggedIn']) {
        router.push({
          name: 'login',
          query: { redirect: route.fullPath }
        })
        return
      }

      try {
        await store.dispatch('promotion/participate', promotion.value.id)
        promotion.value.hasParticipated = true
        promotion.value.participantCount++
      } catch (err) {
        error.value = '參與活動失敗，請稍後再試'
        console.error('Error participating in promotion:', err)
      }
    }

    const sharePromotion = async () => {
      const shareData = {
        title: promotion.value.title,
        text: promotion.value.description,
        url: window.location.href
      }

      try {
        if (navigator.share) {
          await navigator.share(shareData)
          promotion.value.shareCount++
        } else {
          await navigator.clipboard.writeText(window.location.href)
          store.dispatch('notification/show', {
            type: 'success',
            message: '連結已複製到剪貼簿'
          })
        }
      } catch (err) {
        console.error('Error sharing promotion:', err)
      }
    }

    const addToCalendar = () => {
      const start = new Date(promotion.value.startDate)
      const end = new Date(promotion.value.endDate)
      const title = promotion.value.title
      const details = promotion.value.description

      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${end.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(details)}`

      window.open(googleCalendarUrl, '_blank')
    }

    const updateCountdown = () => {
      if (!promotion.value) return

      const now = new Date().getTime()
      const targetDate = new Date(
          promotion.value.status === 'upcoming'
              ? promotion.value.startDate
              : promotion.value.endDate
      ).getTime()

      const distance = targetDate - now

      if (distance < 0) {
        countdown.value = { days: 0, hours: 0, minutes: 0 }
        return
      }

      countdown.value = {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      }
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-TW')
    }

    const handleImageError = (event) => {
      event.target.src = require('@/assets/images/default-promotion.jpg')
    }

    // 計時器
    let countdownTimer = null

    onMounted(() => {
      fetchPromotionDetails()
      fetchRelatedPromotions()
      countdownTimer = setInterval(updateCountdown, 60000) // 每分鐘更新一次
    })

    onUnmounted(() => {
      if (countdownTimer) {
        clearInterval(countdownTimer)
      }
    })

    return {
      // 狀態
      loading,
      error,
      promotion,
      relatedPromotions,
      isFavorite,
      countdown,

      // 計算屬性
      getStatusClass,
      getStatusText,
      canParticipate,
      getParticipateButtonText,

      // 方法
      toggleFavorite,
      participate,
      sharePromotion,
      addToCalendar,
      formatDate,
      handleImageError
    }
  }
}
</script>

<style scoped>
.promotion-detail {
  min-height: 100vh;
  padding-top: 60px;
}

.promotion-header {
  background-color: white;
  border-bottom: 1px solid #dee2e6;
}

.promotion-image-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.promotion-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 8px 16px;
  border-radius: 20px;
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

.promotion-info {
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.promotion-title {
  font-size: 2rem;
  font-weight: 600;
  color: #212529;
}

.favorite-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.promotion-time,
.promotion-location {
  font-size: 1rem;
  color: #6c757d;
}

.promotion-time i,
.promotion-location i {
  margin-right: 0.5rem;
}

.promotion-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
}

.content-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.side-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.countdown {
  display: flex;
  justify-content: space-around;
  margin: 1rem 0;
}

.countdown-item {
  text-align: center;
}

.countdown-item .number {
  font-size: 2rem;
  font-weight: 600;
  color: #007bff;
}

.countdown-item .label {
  font-size: 0.875rem;
  color: #6c757d;
}

.qr-code {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.qr-code img {
  width: 200px;
  height: 200px;
}

.related-promotion-item {
  margin-bottom: 1rem;
}

.related-promotion-link {
  display: flex;
  gap: 1rem;
  text-decoration: none;
  color: inherit;
}

.related-promotion-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.related-promotion-title {
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.related-promotion-date {
  font-size: 0.875rem;
  color: #6c757d;
  margin: 0;
}

@media (max-width: 768px) {
  .promotion-image {
    height: 300px;
  }

  .promotion-info {
    padding: 1rem;
  }

  .promotion-title {
    font-size: 1.5rem;
  }

  .promotion-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .countdown-item .number {
    font-size: 1.5rem;
  }
}
</style>
