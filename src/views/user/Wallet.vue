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

        <!-- 電影票列表 -->
        <div class="ticket-list">
          <div v-if="!movieTickets.length" class="text-center py-5">
            <i class="fas fa-ticket-alt fa-3x mb-3 text-muted"></i>
            <p class="text-muted">目前沒有電影票</p>
          </div>

          <div v-else class="row g-4">
            <div v-for="ticket in movieTickets"
                 :key="ticket.id"
                 class="col-md-3">
              <div class="ticket-card">
                <div class="ticket-header">
                  <h5>{{ ticket.movie_title }}</h5>
                  <span :class="getStatusClass(ticket.status)">
                    {{ getStatusText(ticket.status) }}
                  </span>
                </div>
                <div class="ticket-body">
                  <p><i class="fas fa-map-marker-alt"></i>逢甲市電影院</p>
                  <p><i class="fas fa-calendar"></i> {{ formatDateTime(ticket.show_time) }}</p>
                  <p><i class="fa-solid fa-film"></i> {{ ticket.hall }}</p>
                  <p><i class="fas fa-chair"></i> {{ ticket.seat_number }}</p>
                </div>
                <div class="ticket-footer">
                  <div class="ticket-footer d-flex justify-content-between align-items-center">
                    <button class="btn btn-outline-primary"
                            @click="showQRCode(ticket)"
                            :disabled="ticket.status !== 'VALID'">
                      QR Code
                    </button>
                    <button class="btn btn-outline-danger"
                            @click="cancelTicket(ticket.id)"
                            :disabled="ticket.status !== 'VALID'">
                      取消訂票
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showQRCodeModal" class="modal-backdrop show"></div>
  <div v-if="showQRCodeModal"
       class="modal d-block"
       tabindex="-1"
       role="dialog"
       aria-modal="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title">
            <p class="mb-0">{{ ticket.movie_title }} {{ formatDateTime(ticket.show_time) }} {{ ticket.hall }} {{ ticket.seat_number }}</p>
          </div>
          <button type="button"
                  class="btn-close"
                  @click="closeQRCodeModal"
                  aria-label="Close"></button>
        </div>
        <div class="modal-body text-center">
          <img :src="qrCodeData.qrCodeImage"
               alt="QR Code"
               class="img-fluid">
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'
import { apiService } from '@/services/api.config'

const store = useStore()
const router = useRouter()
const route = useRoute()
const activeTab = ref('movie')
const isLoading = ref(false)
const error = ref(null)
const movieTickets = ref([])
const discountCoupons = ref([])
const currentPage = ref(0)
const pageSize = ref(10)
const hasNextPage = ref(false)
const showQRCodeModal = ref(false)
const qrCodeData = ref({
  qrCodeImage: '',
  qrCodeData: '',
  ticketId: null
})

// 獲取票券列表
const fetchTickets = async (page) => {
  if (page < 0) return;
  try {
    currentPage.value = page;
    isLoading.value = true;
    const response = await apiService.get('/movietickets/user');
    if (response?.data) {
      // 原始電影票數據
      movieTickets.value = response.data;

      // 排序邏輯
      movieTickets.value.sort((a, b) => {
        const statusOrder = {
          'VALID': 1,
          'USED': 2,
          'CANCELLED': 3
        };

        // 先按狀態排序
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }

        // 再按上映時間遞增排序
        const timeA = new Date(a.show_time).getTime();
        const timeB = new Date(b.show_time).getTime();
        return timeA - timeB;
      });

      hasNextPage.value = movieTickets.value.length === pageSize.value;
    }
  } catch (err) {
    console.error('獲取票券失敗:', err);
    error.value = '獲取票券失敗';
  } finally {
    isLoading.value = false;
  }
};

// 取消訂票
const cancelTicket = async (ticketId) => {
  if (!ticketId) return
  try {
    // 確認視窗
    if (!confirm('確定要取消此張電影票嗎？')) {
      return
    }

    const response = await apiService.post(`/movietickets/cancel/${ticketId}`)

    if (response?.data) {
      // 重新取得票券列表
      await fetchTickets(currentPage.value)
      // 顯示成功訊息
      store.dispatch('setNotification', {
        type: 'success',
        message: '已成功取消訂票',
        duration: 3000
      })
    }
  } catch (err) {
    console.error('取消訂票失敗:', err)
    // 顯示錯誤訊息
    store.dispatch('setNotification', {
      type: 'error',
      message: '取消訂票失敗',
      duration: 3000
    })
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

const ticket = ref(null) // 新增此狀態
watch(route, async (to, from) => {
  // 檢查當前路徑是否為 wallet 相關路由
  if (to.name?.startsWith('wallet') || from.name?.startsWith('wallet')) {
    await fetchTickets(0)
  }
}, { immediate: true })

const showQRCode = async (ticketData) => {
  if (!ticketData?.id) return
  try {
    ticket.value = ticketData // 保存當前票券資訊
    const response = await apiService.get(`/demo/qrcode/show/${ticketData.id}`)
    if (response?.data) {
      qrCodeData.value = response.data
      showQRCodeModal.value = true
    }
  } catch (err) {
    console.error('獲取 QR Code 失敗:', err)
    store.dispatch('setNotification', {
      type: 'error',
      message: '獲取 QR Code 失敗',
      duration: 3000
    })
  }
}

const closeQRCodeModal = () => {
  showQRCodeModal.value = false
  qrCodeData.value = {
    qrCodeImage: '',
    qrCodeData: '',
    ticketId: null
  }
  ticket.value = null
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

onMounted(() =>
    fetchTickets(0))
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
