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
        <h1 class="dashboard-title m-4">管理員儀表板</h1>

        <div class="row">
          <!-- 管理功能快速入口 -->
          <div class="management-shortcuts mt-4 justify-content-center align-items-center text-center">
            <h3>後台管理</h3>
            <div class="row g-4 justify-content-center align-items-center mt-2 mb-5 ">
              <div class="col-md-3">
                <router-link to="/admin/MovieManagement" class="management-card">
                  <div class="card">
                    <div class="card-body">
                      <i class="fas fa-film"></i>
                      <h4>電影管理</h4>
                      <p>管理電影資訊與場次</p>
                    </div>
                  </div>
                </router-link>
              </div>

              <div class="col-md-3">
                <router-link to="/admin/UserManagement" class="management-card">
                  <div class="card">
                    <div class="card-body">
                      <i class="fas fa-users"></i>
                      <h4>會員管理</h4>
                      <p>管理會員資料與權限</p>
                    </div>
                  </div>
                </router-link>
              </div>

              <div class="col-md-3">
                <router-link to="/admin/DiscountManagement" class="management-card">
                  <div class="card">
                    <div class="card-body">
                      <i class="fas fa-tags"></i>
                      <h4>優惠管理</h4>
                      <p>管理優惠券與折扣</p>
                    </div>
                  </div>
                </router-link>
              </div>

              <div class="col-md-3">
                <router-link to="/admin/StoreManagement" class="management-card">
                  <div class="card">
                    <div class="card-body">
                      <i class="fas fa-store"></i>
                      <h4>商店管理</h4>
                      <p>管理特約商店</p>
                    </div>
                  </div>
                </router-link>
              </div>

              <div class="col-md-3">
                <router-link to="/admin/PromotionManagement" class="management-card">
                  <div class="card">
                    <div class="card-body">
                      <i class="fas fa-bullhorn"></i>
                      <h4>活動管理</h4>
                      <p>管理優惠活動</p>
                    </div>
                  </div>
                </router-link>
              </div>

            </div>
          </div>
        </div>
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
        <div class="row g-4 p-5 ">
          <!-- 每日營收圖表 -->
          <div class="col-md-8 ">
            <div class="chart-card">
              <h3>每日營收趨勢</h3>
              <canvas ref="revenueChartRef"></canvas>
            </div>
          </div>

          <!-- 會員分析圖表 -->
          <div class="col-md-4">
            <div class="chart-card p-5">
              <h3>會員分析</h3>
              <canvas ref="userChartRef"></canvas>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import Chart from 'chart.js/auto'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'

// 模擬數據
const mockData = {
  stats: {
    totalUsers: 1250,
    newUsers: 48,
    monthlyBookings: 326,
    bookingGrowth: 12.5,
    monthlyRevenue: 158900,
    revenueGrowth: 8.3,
    discountUsage: 65,
    discountGrowth: 5.2
  },
  revenueData: {
    labels: ['1/1', '1/2', '1/3', '1/4', '1/5', '1/6', '1/7'],
    data: [25000, 32000, 28000, 35000, 40000, 38000, 45000]
  },
  userData: {
    labels: ['新會員', '一般會員', '進階會員', 'VIP會員'],
    data: [250, 650, 280, 70]
  },
  recentOrders: [
    {
      id: 1,
      orderNumber: 'ORD20240101001',
      userName: '王小明',
      movieTitle: '蜘蛛人：穿越新宇宙',
      amount: 350,
      status: 'COMPLETED',
      createdAt: '2024-01-01T10:30:00'
    },
    {
      id: 2,
      orderNumber: 'ORD20240101002',
      userName: '李小華',
      movieTitle: '玩具總動員 4',
      amount: 280,
      status: 'PENDING',
      createdAt: '2024-01-01T11:15:00'
    },
    {
      id: 3,
      orderNumber: 'ORD20240101003',
      userName: '張小美',
      movieTitle: '魔物獵人',
      amount: 320,
      status: 'COMPLETED',
      createdAt: '2024-01-01T13:45:00'
    },
    {
      id: 4,
      orderNumber: 'ORD20240101004',
      userName: '陳大寶',
      movieTitle: '復仇者聯盟：終局之戰',
      amount: 380,
      status: 'CANCELLED',
      createdAt: '2024-01-01T14:20:00'
    },
    {
      id: 5,
      orderNumber: 'ORD20240101005',
      userName: '林小玉',
      movieTitle: '哥吉拉大戰金剛',
      amount: 300,
      status: 'COMPLETED',
      createdAt: '2024-01-01T15:10:00'
    }
  ]
}

export default {
  name: 'AdminDashboard',

  components: {
    LoadingSpinner,
    AlertMessage
  },

  setup() {
    const store = useStore()
    const revenueChartRef = ref(null)
    const userChartRef = ref(null)
    const revenueChart = ref(null)
    const userChart = ref(null)
    const isLoading = ref(false)
    const error = ref(null)
    const useMockData = ref(true) // 控制是否使用假資料

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
      try {
        // 清除舊的圖表實例
        if (revenueChart.value) {
          revenueChart.value.destroy()
        }
        if (userChart.value) {
          userChart.value.destroy()
        }

        // 創建營收趨勢圖
        const revenueCtx = revenueChartRef.value.getContext('2d')
        revenueChart.value = new Chart(revenueCtx, {
          type: 'line',
          data: {
            labels: revenueData.labels,
            datasets: [{
              label: '每日營收',
              data: revenueData.data,
              borderColor: '#4CAF50',
              tension: 0.4,
              fill: false
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            }
          }
        })

        // 創建會員分析圖
        const userCtx = userChartRef.value.getContext('2d')
        userChart.value = new Chart(userCtx, {
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
      } catch (err) {
        console.error('Chart initialization error:', err)
        error.value = '圖表初始化失敗'
      }
    }

    // 檢查 API 可用性
    const checkApiAvailability = async () => {
      try {
        const response = await store.dispatch('admin/checkApiStatus')
        useMockData.value = !response.success
      } catch (err) {
        console.error('API check failed:', err)
        useMockData.value = true
      }
    }

    // 獲取儀表板數據
    const fetchDashboardData = async () => {
      try {
        isLoading.value = true
        error.value = null

        if (useMockData.value) {
          // 使用模擬數據
          setTimeout(() => {
            stats.value = mockData.stats
            recentOrders.value = mockData.recentOrders
            initCharts(mockData.revenueData, mockData.userData)
            isLoading.value = false
          }, 1000)
        } else {
          // 使用真實 API
          const response = await store.dispatch('admin/fetchDashboardData')
          if (response.success) {
            stats.value = response.stats
            recentOrders.value = response.recentOrders
            initCharts(response.revenueData, response.userData)
          } else {
            throw new Error(response.message || '獲取數據失敗')
          }
          isLoading.value = false
        }
      } catch (err) {
        error.value = '載入儀表板數據失敗，請稍後再試'
        console.error('Dashboard error:', err)
        isLoading.value = false
      }
    }

    // 格式化數字
    const formatNumber = (number) => {
      if (typeof number !== 'number') return '0'
      return number.toLocaleString('zh-TW')
    }

    // 格式化日期時間
    const formatDateTime = (datetime) => {
      if (!datetime) return ''
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

    // 清理圖表
    const cleanupCharts = () => {
      if (revenueChart.value) {
        revenueChart.value.destroy()
        revenueChart.value = null
      }
      if (userChart.value) {
        userChart.value.destroy()
        userChart.value = null
      }
    }

    onMounted(async () => {
      await checkApiAvailability()
      await fetchDashboardData()
    })

    onUnmounted(() => {
      cleanupCharts()
    })

    return {
      isLoading,
      error,
      stats,
      recentOrders,
      revenueChartRef,
      userChartRef,
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
