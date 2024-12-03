<template>
  <div class="wallet-page">
    <div class="container py-4">
      <!-- 載入中狀態 -->
      <LoadingSpinner v-if="isLoading" />

      <!-- 錯誤提示 -->
      <AlertMessage v-if="error" type="error" :message="error" />

      <div v-else>
        <!-- 標題區域 -->
        <h1 class="page-title mb-4">我的票券</h1>

        <!-- 票券類型切換 -->
        <ul class="nav nav-tabs mb-4">
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'movie' }"
               @click="activeTab = 'movie'">電影票</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'discount' }"
               @click="activeTab = 'discount'">優惠券</a>
          </li>
        </ul>

        <!-- 電影票列表 -->
        <div v-if="activeTab === 'movie'" class="ticket-list">
          <div v-if="movieTickets.length === 0" class="text-center py-5">
            <i class="fas fa-ticket-alt fa-3x mb-3 text-muted"></i>
            <p class="text-muted">目前沒有電影票</p>
          </div>
          <div v-else class="row g-4">
            <div v-for="ticket in movieTickets" :key="ticket.id" class="col-md-6">
              <div class="ticket-card">
                <div class="ticket-header">
                  <h5>{{ ticket.movieTitle }}</h5>
                  <span :class="getStatusClass(ticket.status)">
                    {{ getStatusText(ticket.status) }}
                  </span>
                </div>
                <div class="ticket-body">
                  <p><i class="fas fa-calendar"></i> {{ formatDateTime(ticket.showTime) }}</p>
                  <p><i class="fas fa-map-marker-alt"></i> {{ ticket.hall }}</p>
                  <p><i class="fas fa-chair"></i> {{ ticket.seatNumber }}</p>
                </div>
                <div class="ticket-footer">
                  <button class="btn btn-outline-primary"
                          @click="showTicketDetail(ticket)"
                          :disabled="ticket.status === 'USED'">
                    查看詳情
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 優惠券列表 -->
        <div v-if="activeTab === 'discount'" class="coupon-list">
          <div v-if="discountCoupons.length === 0" class="text-center py-5">
            <i class="fas fa-tag fa-3x mb-3 text-muted"></i>
            <p class="text-muted">目前沒有優惠券</p>
          </div>
          <div v-else class="row g-4">
            <div v-for="coupon in discountCoupons" :key="coupon.id" class="col-md-6">
              <div class="coupon-card">
                <div class="coupon-header">
                  <h5>{{ coupon.title }}</h5>
                  <span :class="getStatusClass(coupon.status)">
                    {{ getStatusText(coupon.status) }}
                  </span>
                </div>
                <div class="coupon-body">
                  <p>{{ coupon.description }}</p>
                  <p><i class="fas fa-clock"></i> 有效期限：{{ formatDate(coupon.expiryDate) }}</p>
                </div>
                <div class="coupon-footer">
                  <button class="btn btn-outline-primary"
                          @click="showCouponDetail(coupon)"
                          :disabled="coupon.status === 'USED' || coupon.status === 'EXPIRED'">
                    使用優惠券
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'

export default {
  name: 'Wallet',
  components: {
    LoadingSpinner,
    AlertMessage
  },
  setup() {
    const store = useStore()
    const activeTab = ref('movie')
    const isLoading = ref(false)
    const error = ref(null)
    const movieTickets = ref([])
    const discountCoupons = ref([])

// 模擬票券資料
    const mockTickets = {
      movieTickets: [
        {
          id: 1,
          movieTitle: '蜘蛛人：穿越新宇宙',
          showTime: '2024-01-15T14:30:00',
          hall: 'A廳',
          seatNumber: 'A12',
          status: 'VALID'
        },
        {
          id: 2,
          movieTitle: '玩具總動員4',
          showTime: '2024-01-20T16:30:00',
          hall: 'B廳',
          seatNumber: 'B15',
          status: 'USED'
        }
      ],
      discountCoupons: [
        {
          id: 1,
          title: '電影票9折優惠',
          description: '適用於所有電影票購買',
          expiryDate: '2024-02-01',
          status: 'VALID'
        },
        {
          id: 2,
          title: '套餐優惠券',
          description: '購買套餐享有85折優惠',
          expiryDate: '2024-01-31',
          status: 'EXPIRED'
        }
      ]
    }

// 獲取票券資料
    const fetchTickets = async () => {
      try {
        isLoading.value = true
        error.value = null

// 使用模擬資料
        setTimeout(() => {
          movieTickets.value = mockTickets.movieTickets
          discountCoupons.value = mockTickets.discountCoupons
          isLoading.value = false
        }, 1000)

// 實際 API 調用（目前註釋掉）
        /*
        const response = await store.dispatch('wallet/fetchTickets')
        if (response.success) {
        movieTickets.value = response.data.movieTickets
        discountCoupons.value = response.data.discountCoupons
        } else {
        throw new Error(response.message || '獲取票券資料失敗')
        }
        */
      } catch (err) {
        error.value = '無法載入票券資料'
        console.error('Fetch tickets error:', err)
      } finally {
        isLoading.value = false
      }
    }

// 格式化日期時間
    const formatDateTime = (datetime) => {
      if (!datetime) return ''
      return new Date(datetime).toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

// 格式化日期
    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }

// 取得狀態樣式
    const getStatusClass = (status) => {
      const classes = {
        'VALID': 'status-valid',
        'USED': 'status-used',
        'EXPIRED': 'status-expired'
      }
      return classes[status] || 'status-default'
    }

// 取得狀態文字
    const getStatusText = (status) => {
      const texts = {
        'VALID': '可使用',
        'USED': '已使用',
        'EXPIRED': '已過期'
      }
      return texts[status] || '未知'
    }

// 顯示票券詳情
    const showTicketDetail = (ticket) => {
      console.log('查看票券詳情:', ticket)
// TODO: 實作票券詳情顯示邏輯
    }

// 顯示優惠券詳情
    const showCouponDetail = (coupon) => {
      console.log('使用優惠券:', coupon)
// TODO: 實作優惠券使用邏輯
    }

    onMounted(() => {
      fetchTickets()
    })

    return {
      activeTab,
      isLoading,
      error,
      movieTickets,
      discountCoupons,
      formatDateTime,
      formatDate,
      getStatusClass,
      getStatusText,
      showTicketDetail,
      showCouponDetail
    }
  }
}
</script>

<style scoped>
.wallet-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.page-title {
  color: #BA0043;
  font-weight: 600;
}

.nav-tabs .nav-link {
  color: #495057;
  cursor: pointer;
}

.nav-tabs .nav-link.active {
  color: #BA0043;
  border-color: #BA0043;
}

.ticket-card, .coupon-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.ticket-header, .coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.status-valid {
  color: #28a745;
}

.status-used {
  color: #6c757d;
}

.status-expired {
  color: #dc3545;
}

.ticket-body, .coupon-body {
  margin-bottom: 1rem;
}

.ticket-body p, .coupon-body p {
  margin-bottom: 0.5rem;
}

.ticket-body i, .coupon-body i {
  margin-right: 0.5rem;
  color: #BA0043;
}

.btn-outline-primary {
  color: #BA0043;
  border-color: #BA0043;
}

.btn-outline-primary:hover {
  background-color: #BA0043;
  color: white;
}

.btn-outline-primary:disabled {
  color: #6c757d;
  border-color: #6c757d;
}

@media (max-width: 768px) {
  .ticket-card, .coupon-card {
    padding: 1rem;
  }
}
</style>
