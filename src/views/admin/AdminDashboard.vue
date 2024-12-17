<template>
  <div class="admin-dashboard">
    <div class="container">
      <LoadingSpinner v-if="isLoading" />
      <AlertMessage v-if="error" type="error" :message="error" />

      <div v-else-if="!isDataLoaded" class="text-center">
        <p>無法載入數據</p>
      </div>

      <div v-else class="dashboard-content">
        <h1 class="dashboard-title m-4">管理員儀表板</h1>

        <!-- Management shortcuts section -->
        <div class="management-shortcuts mt-4">
          <h3>後台管理</h3>
          <div class="row g-4 justify-content-center mt-2 mb-5">
            <div class="col-md-4" v-for="(item, index) in managementItems" :key="index">
              <router-link :to="item.route" class="management-card">
                <div class="card">
                  <div class="card-body">
                    <i :class="item.icon"></i>
                    <h4>{{ item.title }}</h4>
                    <p>{{ item.description }}</p>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <!-- Statistics cards section -->
        <div class="row g-4 mb-4">
          <div class="col-md-4" v-for="(stat, index) in statsCards" :key="index">
            <div class="stat-card">
              <div class="stat-icon">
                <i :class="stat.icon"></i>
              </div>
              <div class="stat-info">
                <h3>{{ stat.title }}</h3>
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-change">
                  <i class="fas fa-arrow-up"></i>
                  {{ stat.change }} 新增
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts section -->
        <div class="row g-4">
          <div class="col-md-6" v-for="(chart, index) in chartData" :key="index">
            <div class="chart-card">
              <h3>{{ chart.title }}</h3>
              <canvas :ref="chart.ref"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
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
    const userChartRef = ref(null)
    const storeChartRef = ref(null)
    let userChart = null
    let storeChart = null
    const isLoading = ref(false)
    const error = ref(null)
    const isDataLoaded = ref(false)

    const stats = ref({
      totalUsers: 0,
      newUsers: 0,
      totalStores: 0,
      newStores: 0,
      activeMovies: 0,
      newMovies: 0
    })

    const managementItems = [
      { route: '/admin/movies', icon: 'fas fa-film', title: '電影管理', description: '管理電影資訊與場次' },
      { route: '/admin/users', icon: 'fas fa-users', title: '會員管理', description: '管理會員資料與權限' },
      { route: '/admin/stores', icon: 'fas fa-store', title: '商店管理', description: '管理特約商店' }
    ]

    const statsCards = computed(() => [
      { icon: 'fas fa-users', title: '總會員數', value: stats.value.totalUsers, change: stats.value.newUsers },
      { icon: 'fas fa-store', title: '特約商店數', value: stats.value.totalStores, change: stats.value.newStores },
      { icon: 'fas fa-film', title: '上映電影數', value: stats.value.activeMovies, change: stats.value.newMovies }
    ])

    const chartData = [
      { title: '會員分析', ref: 'userChartRef' },
      { title: '商店類型分析', ref: 'storeChartRef' }
    ]

    const initCharts = (userRoleData, storeCategoryData) => {
      try {
        if (userChart) userChart.destroy()
        if (storeChart) storeChart.destroy()

        if (userChartRef.value && userRoleData && Object.keys(userRoleData).length > 0) {
          const userCtx = userChartRef.value.getContext('2d')
          userChart = new Chart(userCtx, {
            type: 'doughnut',
            data: {
              labels: Object.keys(userRoleData),
              datasets: [{
                data: Object.values(userRoleData),
                backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0']
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom' } }
            }
          })
        }

        if (storeChartRef.value && storeCategoryData && Object.keys(storeCategoryData).length > 0) {
          const storeCtx = storeChartRef.value.getContext('2d')
          storeChart = new Chart(storeCtx, {
            type: 'pie',
            data: {
              labels: Object.keys(storeCategoryData),
              datasets: [{
                data: Object.values(storeCategoryData),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom' } }
            }
          })
        }
      } catch (err) {
        console.error('Chart initialization error:', err)
        error.value = '圖表初始化失敗: ' + err.message
      }
    }

    const validateDashboardData = (data) => {
      if (!data || typeof data !== 'object') {
        throw new Error('無效的響應數據格式')
      }

      const requiredFields = ['totalUsers', 'newUsers', 'totalStores', 'newStores', 'activeMovies', 'newMovies']
      for (const field of requiredFields) {
        if (typeof data[field] !== 'number') {
          console.warn(`Missing or invalid field: ${field}`)
          data[field] = 0
        }
      }

      if (!data.userRoleDistribution || typeof data.userRoleDistribution !== 'object') {
        console.warn('Invalid user role distribution data')
        data.userRoleDistribution = {}
      }

      if (!data.storeCategoryDistribution || typeof data.storeCategoryDistribution !== 'object') {
        console.warn('Invalid store category distribution data')
        data.storeCategoryDistribution = {}
      }

      return data
    }

    const fetchDashboardData = async () => {
      try {
        isLoading.value = true
        error.value = null
        isDataLoaded.value = false

        const response = await store.dispatch('admin/fetchDashboardData')

        if (!response || !response.success) {
          throw new Error(response.error || '獲取儀表板數據失敗')
        }

        const validatedData = validateDashboardData(response.data)

        stats.value = {
          totalUsers: validatedData.totalUsers,
          newUsers: validatedData.newUsers,
          totalStores: validatedData.totalStores,
          newStores: validatedData.newStores,
          activeMovies: validatedData.activeMovies,
          newMovies: validatedData.newMovies
        }

        initCharts(validatedData.userRoleDistribution, validatedData.storeCategoryDistribution)

        isDataLoaded.value = true
      } catch (err) {
        console.error('Dashboard error:', err)
        error.value = '載入儀表板數據失敗: ' + (err.message || '未知錯誤')
        isDataLoaded.value = false
      } finally {
        isLoading.value = false
      }
    }

    const cleanupCharts = () => {
      if (userChart) {
        userChart.destroy()
        userChart = null
      }
      if (storeChart) {
        storeChart.destroy()
        storeChart = null
      }
    }

    onMounted(async () => {
      await fetchDashboardData()
    })

    onUnmounted(() => {
      cleanupCharts()
    })

    return {
      isLoading,
      error,
      stats,
      userChartRef,
      storeChartRef,
      isDataLoaded,
      managementItems,
      statsCards,
      chartData
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
  margin-bottom: 2rem;
}

/* 管理卡片樣式 */
.management-shortcuts {
  margin-bottom: 3rem;
}

.management-card {
  text-decoration: none;
  color: var(--text-color);
  transition: all 0.3s ease;
  display: block;
}

.management-card .card {
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.management-card:hover .card {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow-lg);
}

.management-card .card-body {
  padding: 2rem 1.5rem;
  text-align: center;
}

.management-card i {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.management-card h4 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.management-card p {
  font-size: 0.875rem;
  color: var(--text-light);
  margin: 0;
}

/* 統計卡片樣式 */
.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
  height: 100%;
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
  color: var(--text-light);
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
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* 圖表卡片樣式 */
.chart-card {
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  height: 400px;
  margin-bottom: 2rem;
}

.chart-card h3 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  color: var(--text-color);
}

/* 響應式設計 */
@media (max-width: 1200px) {
  .management-card .card-body {
    padding: 1.5rem 1rem;
  }

  .management-card i {
    font-size: 2rem;
  }
}

@media (max-width: 992px) {
  .stat-card {
    padding: 1.25rem;
  }

  .chart-card {
    height: 350px;
  }
}

@media (max-width: 768px) {
  .dashboard-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .management-card i {
    font-size: 1.75rem;
  }

  .management-card h4 {
    font-size: 1.1rem;
  }

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
    margin-bottom: 1.5rem;
  }
}

@media (max-width: 576px) {
  .admin-dashboard {
    padding: 1rem 0;
  }

  .management-card .card-body {
    padding: 1rem;
  }

  .chart-card {
    height: 250px;
    padding: 1rem;
  }

  .chart-card h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
}
</style>
