<template>
  <div class="discount-detail">
    <div class="container">
      <!-- 載入中狀態 -->
      <LoadingSpinner v-if="isLoading" />

      <!-- 錯誤提示 -->
      <AlertMessage
          v-if="error"
          type="error"
          :message="error"
      />

      <!-- 優惠券詳情 -->
      <div v-if="discount" class="discount-content">
        <div class="row">
          <!-- 優惠券圖片 -->
          <div class="col-md-4">
            <div class="discount-image">
              <img
                  :src="discount.imageUrl || require('@/assets/images/default-discount.jpg')"
                  :alt="discount.title"
                  class="img-fluid rounded"
              >
            </div>
          </div>

          <!-- 優惠券資訊 -->
          <div class="col-md-8">
            <div class="discount-info">
              <!-- 標題和狀態 -->
              <div class="d-flex justify-content-between align-items-start mb-3">
                <h1 class="discount-title">{{ discount.title }}</h1>
                <span
                    class="badge"
                    :class="getStatusClass(discount.status)"
                >
                  {{ getStatusText(discount.status) }}
                </span>
              </div>

              <!-- 優惠內容 -->
              <div class="discount-description mb-4">
                {{ discount.description }}
              </div>

              <!-- 使用條件 -->
              <div class="discount-terms mb-4">
                <h3>使用條件</h3>
                <ul class="list-unstyled">
                  <li v-if="discount.minPurchase">
                    <i class="fas fa-check-circle text-success me-2"></i>
                    最低消費：NT$ {{ formatNumber(discount.minPurchase) }}
                  </li>
                  <li v-if="discount.maxDiscount">
                    <i class="fas fa-check-circle text-success me-2"></i>
                    最高折抵：NT$ {{ formatNumber(discount.maxDiscount) }}
                  </li>
                  <li>
                    <i class="fas fa-calendar-alt text-primary me-2"></i>
                    有效期限：{{ formatDate(discount.startDate) }} - {{ formatDate(discount.endDate) }}
                  </li>
                </ul>
              </div>

              <!-- 使用說明 -->
              <div class="discount-usage mb-4">
                <h3>使用說明</h3>
                <div class="usage-steps">
                  <div v-for="(step, index) in discount.usageSteps" :key="index" class="step">
                    <span class="step-number">{{ index + 1 }}</span>
                    {{ step }}
                  </div>
                </div>
              </div>

              <!-- 領取按鈕 -->
              <div class="discount-actions">
                <button
                    class="btn btn-primary btn-lg"
                    :disabled="!canClaim"
                    @click="handleClaim"
                >
                  <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ getActionButtonText() }}
                </button>
                <small class="text-muted d-block mt-2">
                  {{ getActionDescription() }}
                </small>
              </div>
            </div>
          </div>
        </div>

        <!-- 使用須知 -->
        <div class="discount-notes mt-5">
          <h3>使用須知</h3>
          <div class="alert alert-info">
            <ul class="mb-0">
              <li v-for="(note, index) in discount.notes" :key="index">
                {{ note }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'

export default {
  name: 'DiscountDetail',

  components: {
    LoadingSpinner,
    AlertMessage
  },

  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()

    const discount = ref(null)
    const isLoading = ref(false)
    const error = ref(null)

    // 計算屬性
    const isLoggedIn = computed(() => store.getters['auth/isLoggedIn'])
    const canClaim = computed(() => {
      if (!discount.value || !isLoggedIn.value) return false
      return discount.value.status === 'AVAILABLE' &&
          new Date(discount.value.endDate) > new Date()
    })

    // 獲取優惠券詳情
    const fetchDiscountDetail = async () => {
      try {
        isLoading.value = true
        error.value = null
        const response = await store.dispatch('discount/fetchDiscountDetail', route.params.id)
        discount.value = response.data
      } catch (err) {
        error.value = '載入優惠券詳情失敗'
        console.error('Fetch discount detail error:', err)
      } finally {
        isLoading.value = false
      }
    }

    // 領取優惠券
    const handleClaim = async () => {
      if (!isLoggedIn.value) {
        router.push({
          name: 'login',
          query: { redirect: route.fullPath }
        })
        return
      }

      try {
        isLoading.value = true
        await store.dispatch('discount/claimDiscount', discount.value.id)
        store.dispatch('setNotification', {
          type: 'success',
          message: '優惠券領取成功！'
        })
        router.push('/wallet')
      } catch (err) {
        error.value = err.message || '領取優惠券失敗'
      } finally {
        isLoading.value = false
      }
    }

    // 格式化數字
    const formatNumber = (number) => {
      return number.toLocaleString('zh-TW')
    }

    // 格式化日期
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-TW')
    }

    // 獲取狀態樣式
    const getStatusClass = (status) => {
      switch (status) {
      case 'AVAILABLE':
        return 'bg-success'
      case 'EXPIRED':
        return 'bg-danger'
      case 'CLAIMED':
        return 'bg-warning'
      default:
        return 'bg-secondary'
      }
    }

    // 獲取狀態文字
    const getStatusText = (status) => {
      switch (status) {
      case 'AVAILABLE':
        return '可領取'
      case 'EXPIRED':
        return '已過期'
      case 'CLAIMED':
        return '已領取'
      default:
        return '未知'
      }
    }

    // 獲取按鈕文字
    const getActionButtonText = () => {
      if (!isLoggedIn.value) return '登入後領取'
      if (discount.value?.status === 'CLAIMED') return '已領取'
      if (discount.value?.status === 'EXPIRED') return '已過期'
      return '立即領取'
    }

    // 獲取操作說明
    const getActionDescription = () => {
      if (!isLoggedIn.value) return '請先登入以領取優惠券'
      if (discount.value?.status === 'CLAIMED') return '此優惠券已被領取'
      if (discount.value?.status === 'EXPIRED') return '此優惠券已過期'
      return `剩餘數量：${discount.value?.remainingQuantity || 0}`
    }

    onMounted(() => {
      fetchDiscountDetail()
    })

    return {
      discount,
      isLoading,
      error,
      canClaim,
      handleClaim,
      formatNumber,
      formatDate,
      getStatusClass,
      getStatusText,
      getActionButtonText,
      getActionDescription
    }
  }
}
</script>

<style scoped>
.discount-detail {
  padding: 2rem 0;
}

.discount-image {
  position: relative;
  padding-top: 100%;
  overflow: hidden;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
}

.discount-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discount-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0;
}

.badge {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
}

.discount-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

.discount-terms h3,
.discount-usage h3,
.discount-notes h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.discount-terms li {
  margin-bottom: 0.5rem;
}

.usage-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.discount-actions {
  margin-top: 2rem;
}

.discount-notes .alert {
  font-size: 0.9rem;
}

.discount-notes ul {
  padding-left: 1.5rem;
}

@media (max-width: 768px) {
  .discount-image {
    margin-bottom: 1.5rem;
  }

  .discount-title {
    font-size: 1.5rem;
  }

  .badge {
    font-size: 0.875rem;
  }
}
</style>
