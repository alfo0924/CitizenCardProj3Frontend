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
            <a class="nav-link"
               :class="{ active: activeTab === 'movie' }"
               @click="switchTab('movie')">電影票</a>
          </li>
          <li class="nav-item">
            <a class="nav-link"
               :class="{ active: activeTab === 'discount' }"
               @click="switchTab('discount')">優惠券</a>
          </li>
        </ul>

        <!-- 電影票列表 -->
        <div v-if="activeTab === 'movie'" class="ticket-list">
          <div v-if="!movieTickets.length" class="text-center py-5">
            <i class="fas fa-ticket-alt fa-3x mb-3 text-muted"></i>
            <p class="text-muted">目前沒有電影票</p>
          </div>

          <div v-else class="row g-4">
            <div v-for="ticket in movieTickets"
                 :key="ticket.id"
                 class="col-md-6">
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

          <!-- 分頁控制 -->
          <div v-if="movieTickets.length" class="d-flex justify-content-center mt-4">
            <button class="btn btn-outline-primary me-2"
                    :disabled="currentPage <= 0"
                    @click="changePage(currentPage - 1)">
              上一頁
            </button>
            <button class="btn btn-outline-primary"
                    :disabled="!hasNextPage"
                    @click="changePage(currentPage + 1)">
              下一頁
            </button>
          </div>
        </div>

        <!-- 優惠券列表 -->
        <div v-if="activeTab === 'discount'" class="coupon-list">
          <div v-if="!discountCoupons.length" class="text-center py-5">
            <i class="fas fa-tag fa-3x mb-3 text-muted"></i>
            <p class="text-muted">目前沒有優惠券</p>
          </div>

          <div v-else class="row g-4">
            <div v-for="coupon in discountCoupons"
                 :key="coupon.id"
                 class="col-md-6">
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
import { useRouter } from 'vue-router'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'
import { apiService, endpoints } from '@/services/api.config'

export default {
  name: 'Wallet',

  components: {
    LoadingSpinner,
    AlertMessage
  },

  setup() {
    const store = useStore()
    const router = useRouter()
    const activeTab = ref('movie')
    const isLoading = ref(false)
    const error = ref(null)
    const movieTickets = ref([])
    const discountCoupons = ref([])
    const currentPage = ref(0)
    const pageSize = ref(10)
    const hasNextPage = ref(false)

    const fetchTickets = async (page = 0) => {
      try {
        isLoading.value = true
        error.value = null

        const endpoint = activeTab.value === 'movie' ?
            endpoints.wallet.tickets :
            endpoints.wallet.coupons

        const sortField = activeTab.value === 'movie' ? 'createdAt' : 'expiryDate'
        const sortDirection = activeTab.value === 'movie' ? 'DESC' : 'ASC'

        const response = await apiService.get(endpoint, {
          params: {
            page,
            size: pageSize.value,
            sort: `${sortField},${sortDirection}`
          }
        })

        if (response?.data?.content) {
          if (activeTab.value === 'movie') {
            movieTickets.value = response.data.content.map(ticket => ({
              ...ticket,
              showTime: ticket.showTime ? new Date(ticket.showTime) : null
            }))
          } else {
            discountCoupons.value = response.data.content.map(coupon => ({
              ...coupon,
              expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate) : null
            }))
          }
          hasNextPage.value = !response.data.last
          currentPage.value = page
        }
      } catch (err) {
        console.error('獲取票券失敗:', err)
        error.value = '獲取票券資料失敗，請稍後再試'
        store.dispatch('setNotification', {
          type: 'error',
          message: '獲取票券資料失敗',
          duration: 3000
        })
      } finally {
        isLoading.value = false
      }
    }

    const switchTab = async (tab) => {
      try {
        activeTab.value = tab
        currentPage.value = 0
        await fetchTickets(0)
      } catch (err) {
        console.error('切換標籤失敗:', err)
      }
    }

    const changePage = async (page) => {
      if (page < 0) return
      try {
        await fetchTickets(page)
      } catch (err) {
        console.error('切換頁面失敗:', err)
      }
    }

    const formatDateTime = (datetime) => {
      if (!datetime) return ''
      try {
        const date = datetime instanceof Date ? datetime : new Date(datetime)
        return new Intl.DateTimeFormat('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(date)
      } catch (err) {
        console.error('日期格式化失敗:', err)
        return datetime
      }
    }

    const formatDate = (date) => {
      if (!date) return ''
      try {
        const dateObj = date instanceof Date ? date : new Date(date)
        return new Intl.DateTimeFormat('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(dateObj)
      } catch (err) {
        console.error('日期格式化失敗:', err)
        return date
      }
    }

    const getStatusClass = (status) => {
      const classes = {
        'VALID': 'status-valid',
        'USED': 'status-used',
        'EXPIRED': 'status-expired',
        'CANCELLED': 'status-cancelled'
      }
      return classes[status] || 'status-default'
    }

    const getStatusText = (status) => {
      const texts = {
        'VALID': '可使用',
        'USED': '已使用',
        'EXPIRED': '已過期',
        'CANCELLED': '已取消'
      }
      return texts[status] || '未知狀態'
    }

    const showTicketDetail = async (ticket) => {
      if (!ticket?.id) return
      try {
        const response = await apiService.get(endpoints.wallet.ticketDetail(ticket.id))
        if (response?.data) {
          store.dispatch('wallet/setCurrentTicket', response.data)
          router.push({
            name: 'ticket-detail',
            params: { id: ticket.id }
          })
        }
      } catch (err) {
        store.dispatch('setNotification', {
          type: 'error',
          message: '獲取票券詳情失敗',
          duration: 3000
        })
      }
    }

    const showCouponDetail = async (coupon) => {
      if (!coupon?.id) return
      try {
        const response = await apiService.get(endpoints.wallet.couponDetail(coupon.id))
        if (response?.data) {
          store.dispatch('wallet/setCurrentCoupon', response.data)
          router.push({
            name: 'coupon-detail',
            params: { id: coupon.id }
          })
        }
      } catch (err) {
        store.dispatch('setNotification', {
          type: 'error',
          message: '獲取優惠券詳情失敗',
          duration: 3000
        })
      }
    }

    onMounted(fetchTickets)

    return {
      activeTab,
      isLoading,
      error,
      movieTickets,
      discountCoupons,
      currentPage,
      hasNextPage,
      formatDateTime,
      formatDate,
      getStatusClass,
      getStatusText,
      showTicketDetail,
      showCouponDetail,
      switchTab,
      changePage
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

.ticket-card,
.coupon-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s;
}

.ticket-card:hover,
.coupon-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.ticket-header,
.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.status-valid {
  color: #28a745;
  font-weight: 500;
}

.status-used {
  color: #6c757d;
}

.status-expired {
  color: #dc3545;
}

.ticket-body,
.coupon-body {
  margin-bottom: 1rem;
}

.ticket-body p,
.coupon-body p {
  margin-bottom: 0.5rem;
}

.ticket-body i,
.coupon-body i {
  margin-right: 0.5rem;
  color: #BA0043;
}

.btn-outline-primary {
  color: #BA0043;
  border-color: #BA0043;
  transition: all 0.3s;
}

.btn-outline-primary:hover {
  background-color: #BA0043;
  color: white;
}

.btn-outline-primary:disabled {
  color: #6c757d;
  border-color: #6c757d;
  cursor: not-allowed;
}

.ticket-footer,
.coupon-footer {
  text-align: right;
}

@media (max-width: 768px) {
  .ticket-card,
  .coupon-card {
    padding: 1rem;
  }

  .ticket-header h5,
  .coupon-header h5 {
    font-size: 1rem;
  }

  .btn-outline-primary {
    width: 100%;
  }
}
</style>
