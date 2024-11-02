<template>
  <div class="booking-container">
    <!-- 載入中狀態 -->
    <LoadingSpinner v-if="isLoading" />

    <!-- 錯誤提示 -->
    <AlertMessage
        v-if="error"
        type="error"
        :message="error"
    />

    <!-- 訂票內容 -->
    <div v-else class="booking-content">
      <!-- 電影資訊 -->
      <div class="movie-info mb-4">
        <div class="row">
          <div class="col-md-3">
            <img
                :src="movie.posterUrl || require('@/assets/images/default-poster.jpg')"
                :alt="movie.title"
                class="movie-poster img-fluid"
            >
          </div>
          <div class="col-md-9">
            <h2 class="movie-title">{{ movie.title }}</h2>
            <div class="movie-meta">
              <span><i class="fas fa-clock"></i> {{ formatDateTime(schedule.startTime) }}</span>
              <span><i class="fas fa-map-marker-alt"></i> {{ schedule.venue }}</span>
              <span><i class="fas fa-film"></i> {{ movie.duration }}分鐘</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 座位選擇 -->
      <div class="seat-selection mb-4">
        <h3>選擇座位</h3>
        <div class="screen mb-4">
          <div class="screen-text">螢幕</div>
        </div>
        <div class="seats-container">
          <div
              v-for="row in seatLayout"
              :key="row.rowName"
              class="seat-row"
          >
            <div class="row-name">{{ row.rowName }}</div>
            <div
                v-for="seat in row.seats"
                :key="`${row.rowName}${seat.number}`"
                class="seat"
                :class="{
                'occupied': seat.status === 'OCCUPIED',
                'selected': isSelected(`${row.rowName}${seat.number}`),
                'available': seat.status === 'AVAILABLE'
              }"
                @click="toggleSeat(`${row.rowName}${seat.number}`, seat.status)"
            >
              {{ seat.number }}
            </div>
          </div>
        </div>
        <div class="seat-legend mt-3">
          <div class="legend-item">
            <div class="seat available"></div>
            <span>可選</span>
          </div>
          <div class="legend-item">
            <div class="seat selected"></div>
            <span>已選</span>
          </div>
          <div class="legend-item">
            <div class="seat occupied"></div>
            <span>已售</span>
          </div>
        </div>
      </div>

      <!-- 票價資訊 -->
      <div class="price-info mb-4">
        <h3>票價資訊</h3>
        <div class="price-table">
          <div class="price-row">
            <span>全票</span>
            <span>NT$ {{ formatNumber(schedule.price) }}</span>
          </div>
          <div class="price-row">
            <span>已選座位</span>
            <span>{{ selectedSeats.length }}張</span>
          </div>
          <div class="price-row total">
            <span>總計</span>
            <span>NT$ {{ formatNumber(totalAmount) }}</span>
          </div>
        </div>
      </div>

      <!-- 訂票按鈕 -->
      <div class="booking-actions">
        <button
            class="btn btn-secondary me-2"
            @click="$router.back()"
        >
          返回
        </button>
        <button
            class="btn btn-primary"
            :disabled="!canProceed"
            @click="proceedToPayment"
        >
          <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
          {{ isProcessing ? '處理中...' : '確認訂票' }}
        </button>
      </div>
    </div>

    <!-- 付款確認Modal -->
    <div
        class="modal fade"
        id="paymentModal"
        tabindex="-1"
        ref="paymentModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">確認付款</h5>
            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <div class="payment-details">
              <div class="detail-row">
                <span>電影</span>
                <span>{{ movie.title }}</span>
              </div>
              <div class="detail-row">
                <span>場次</span>
                <span>{{ formatDateTime(schedule.startTime) }}</span>
              </div>
              <div class="detail-row">
                <span>座位</span>
                <span>{{ selectedSeats.join(', ') }}</span>
              </div>
              <div class="detail-row">
                <span>數量</span>
                <span>{{ selectedSeats.length }}張</span>
              </div>
              <div class="detail-row total">
                <span>總金額</span>
                <span>NT$ {{ formatNumber(totalAmount) }}</span>
              </div>
              <div class="wallet-balance mt-3">
                <span>錢包餘額</span>
                <span>NT$ {{ formatNumber(walletBalance) }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
            >
              取消
            </button>
            <button
                type="button"
                class="btn btn-primary"
                :disabled="!canPay || isProcessing"
                @click="confirmPayment"
            >
              <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
              {{ isProcessing ? '處理中...' : '確認付款' }}
            </button>
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
  name: 'Booking',

  components: {
    LoadingSpinner,
    AlertMessage
  },

  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const paymentModal = ref(null)

    // 狀態
    const isLoading = ref(false)
    const error = ref(null)
    const isProcessing = ref(false)
    const selectedSeats = ref([])
    const movie = ref({})
    const schedule = ref({})
    const seatLayout = ref([])

    // 計算屬性
    const totalAmount = computed(() => {
      return selectedSeats.value.length * schedule.value.price
    })

    const walletBalance = computed(() => {
      return store.state.wallet.info.balance
    })

    const canProceed = computed(() => {
      return selectedSeats.value.length > 0
    })

    const canPay = computed(() => {
      return walletBalance.value >= totalAmount.value
    })

    // 初始化數據
    const initializeBooking = async () => {
      try {
        isLoading.value = true
        error.value = null

        // 獲取場次資訊
        const scheduleResponse = await store.dispatch('movie/getScheduleDetail', route.params.scheduleId)
        schedule.value = scheduleResponse

        // 獲取電影資訊
        const movieResponse = await store.dispatch('movie/getMovieDetail', schedule.value.movieId)
        movie.value = movieResponse

        // 獲取座位資訊
        const seatsResponse = await store.dispatch('movie/getScheduleSeats', route.params.scheduleId)
        seatLayout.value = seatsResponse
      } catch (err) {
        error.value = '載入訂票資訊失敗，請稍後再試'
        console.error('Error initializing booking:', err)
      } finally {
        isLoading.value = false
      }
    }

    // 選擇座位
    const toggleSeat = (seatNumber, status) => {
      if (status !== 'AVAILABLE') return

      const index = selectedSeats.value.indexOf(seatNumber)
      if (index === -1) {
        selectedSeats.value.push(seatNumber)
      } else {
        selectedSeats.value.splice(index, 1)
      }
    }

    // 檢查座位是否被選中
    const isSelected = (seatNumber) => {
      return selectedSeats.value.includes(seatNumber)
    }

    // 進行付款
    const proceedToPayment = () => {
      const modal = new Modal(paymentModal.value)
      modal.show()
    }

    // 確認付款
    const confirmPayment = async () => {
      if (!canPay.value) return

      try {
        isProcessing.value = true

        // 建立訂單
        const order = await store.dispatch('movie/createBooking', {
          scheduleId: route.params.scheduleId,
          seats: selectedSeats.value
        })

        // 進行付款
        await store.dispatch('wallet/pay', {
          orderId: order.id,
          amount: totalAmount.value
        })

        // 關閉Modal
        Modal.getInstance(paymentModal.value).hide()

        // 導航到訂單成功頁面
        router.push({
          name: 'booking-success',
          params: { orderId: order.id }
        })
      } catch (err) {
        error.value = '訂票失敗，請稍後再試'
        console.error('Payment error:', err)
      } finally {
        isProcessing.value = false
      }
    }

    // 格式化數字
    const formatNumber = (number) => {
      return number.toLocaleString('zh-TW')
    }

    // 格式化日期時間
    const formatDateTime = (datetime) => {
      return new Date(datetime).toLocaleString('zh-TW')
    }

    onMounted(() => {
      initializeBooking()
    })

    return {
      isLoading,
      error,
      isProcessing,
      movie,
      schedule,
      seatLayout,
      selectedSeats,
      totalAmount,
      walletBalance,
      canProceed,
      canPay,
      paymentModal,
      toggleSeat,
      isSelected,
      proceedToPayment,
      confirmPayment,
      formatNumber,
      formatDateTime
    }
  }
}
</script>

<style scoped>
.wallet-container {
  padding: 2rem 0;
}

.balance-card {
  background-color: var(--primary-color);
  color: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
}

.balance-info h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.balance-amount {
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.transactions-section {
  background-color: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
}

.filters {
  display: flex;
  gap: 1rem;
}

.transaction-list {
  margin-top: 1.5rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 1rem;
  background-color: var(--bg-light);
}

.transaction-info {
  flex: 1;
}

.transaction-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.transaction-time {
  font-size: 0.875rem;
  color: var(--text-light);
}

.transaction-amount {
  font-weight: 600;
}

.amount-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .balance-card,
  .transactions-section {
    padding: 1.5rem;
  }

  .filters {
    flex-direction: column;
  }

  .amount-options {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>