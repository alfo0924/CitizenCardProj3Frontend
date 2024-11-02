<template>
  <div class="admin-dashboard">
    <div class="container">
      <!-- 載入中狀態 -->
      <LoadingSpinner v-if="isLoading" />

      <!-- 錯誤提示 -->
      <AlertMessage
          v-if="error"
          type="error"
          :message="error"
      />

      <!-- 儀表板內容 -->
      <div v-else class="dashboard-content">
        <h1 class="dashboard-title mb-4">管理員儀表板</h1>

        <!-- 統計卡片 -->
        <div class="row g-4 mb-4">
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-users"></i>
              </div>
              <div class="stat-info">
                <h3>總會員數</h3>
                <div class="stat-value">{{ stats.totalUsers }}</div>
                <div class="stat-change">
                  <i class="fas fa-arrow-up"></i>
                  {{ stats.newUsers }} 新增
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-ticket-alt"></i>
              </div>
              <div class="stat-info">
                <h3>本月訂票數</h3>
                <div class="stat-value">{{ stats.monthlyBookings }}</div>
                <div class="stat-change">
                  <i class="fas fa-arrow-up"></i>
                  {{ stats.bookingGrowth }}%
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-wallet"></i>
              </div>
              <div class="stat-info">
                <h3>本月營收</h3>
                <div class="stat-value">NT$ {{ formatNumber(stats.monthlyRevenue) }}</div>
                <div class="stat-change">
                  <i class="fas fa-arrow-up"></i>
                  {{ stats.revenueGrowth }}%
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-percent"></i>
              </div>
              <div class="stat-info">
                <h3>優惠使用率</h3>
                <div class="stat-value">{{ stats.discountUsage }}%</div>
                <div class="stat-change">
                  <i class="fas fa-arrow-up"></i>
                  {{ stats.discountGrowth }}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 圖表區域 -->
        <div class="row g-4">
          <!-- 每日營收圖表 -->
          <div class="col-md-8">
            <div class="chart-card">
              <h3>每日營收趨勢</h3>
              <canvas ref="revenueChart"></canvas>
            </div>
          </div>

          <!-- 會員分析圖表 -->
          <div class="col-md-4">
            <div class="chart-card">
              <h3>會員分析</h3>
              <canvas ref="userChart"></canvas>
            </div>
          </div>
        </div>

        <!-- 最新訂單列表 -->
        <div class="recent-orders mt-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h3>最新訂單</h3>
            <router-link to="/admin/orders" class="btn btn-outline-primary btn-sm">
              查看全部
            </router-link>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
              <tr>
                <th>訂單編號</th>
                <th>會員</th>
                <th>電影</th>
                <th>金額</th>
                <th>狀態</th>
                <th>時間</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="order in recentOrders" :key="order.id">
                <td>{{ order.orderNumber }}</td>
                <td>{{ order.userName }}</td>
                <td>{{ order.movieTitle }}</td>
                <td>NT$ {{ formatNumber(order.amount) }}</td>
                <td>
                    <span
                        class="badge"
                        :class="getOrderStatusClass(order.status)"
                    >
                      {{ getOrderStatusText(order.status) }}
                    </span>
                </td>
                <td>{{ formatDateTime(order.createdAt) }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import Chart from 'chart.js/auto'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'

export default {
  name: 'AdminDashboard',

  components: {
    LoadingSpinner,
    AlertMessage
  },

  setup() {
    const store = useStore()
    const revenueChart = ref(null)
    const userChart = ref(null)
    const isLoading = ref(false)
    const error = ref(null)

    // 統計數據
    const stats = ref({
      totalUsers: 0,
      newUsers: 0,
      monthlyBookings: 0,
      bookingGrowth: 0,
      monthlyRevenue: 0,
      revenueGrowth: 0,
      discountUsage: 0,
      discountGrowth: 0
    })

    // 最新訂單
    const recentOrders = ref([])

    // 初始化圖表
    const initCharts = (revenueData, userData) => {
      // 營收趨勢圖
      new Chart(revenueChart.value, {
        type: 'line',
        data: {
          labels: revenueData.labels,
          datasets: [{
            label: '每日營收',
            data: revenueData.data,
            borderColor: '#4CAF50',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      })

      // 會員分析圖
      new Chart(userChart.value, {
        type: 'doughnut',
        data: {
          labels: userData.labels,
          datasets: [{
            data: userData.data,
            backgroundColor: [
              '#4CAF50',
              '#2196F3',
              '#FFC107',
              '#9C27B0'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      })
    }

    // 獲取儀表板數據
    const fetchDashboardData = async () => {
      try {
        isLoading.value = true
        error.value = null

        const response = await store.dispatch('admin/fetchDashboardData')
        stats.value = response.stats
        recentOrders.value = response.recentOrders

        initCharts(response.revenueData, response.userData)
      } catch (err) {
        error.value = '載入儀表板數據失敗'
        console.error('Dashboard error:', err)
      } finally {
        isLoading.value = false
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

    // 獲取訂單狀態樣式
    const getOrderStatusClass = (status) => {
      switch (status) {
        case 'COMPLETED':
          return 'bg-success'
        case 'PENDING':
          return 'bg-warning'
        case 'CANCELLED':
          return 'bg-danger'
        default:
          return 'bg-secondary'
      }
    }

    // 獲取訂單狀態文字
    const getOrderStatusText = (status) => {
      switch (status) {
        case 'COMPLETED':
          return '已完成'
        case 'PENDING':
          return '處理中'
        case 'CANCELLED':
          return '已取消'
        default:
          return '未知'
      }
    }

    onMounted(() => {
      fetchDashboardData()
    })

    return {
      isLoading,
      error,
      stats,
      recentOrders,
      revenueChart,
      userChart,
      formatNumber,
      formatDateTime,
      getOrderStatusClass,
      getOrderStatusText
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  padding: 2rem 0;
}

.dashboard-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-color);
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-info h3 {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.stat-change {
  font-size: 0.875rem;
  color: var(--success-color);
}

.stat-change i {
  margin-right: 0.25rem;
}

.chart-card {
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  height: 400px;
}

.chart-card h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.recent-orders {
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
}

.recent-orders h3 {
  font-size: 1.25rem;
  margin-bottom: 0;
}

.table th {
  font-weight: 600;
  color: var(--text-secondary);
}

.badge {
  padding: 0.5rem 0.75rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .stat-card {
    padding: 1rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .chart-card {
    height: 300px;
  }
}
</style>