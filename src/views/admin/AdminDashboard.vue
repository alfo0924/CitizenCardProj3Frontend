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

        <!-- 管理功能快速入口 -->
        <div class="management-shortcuts mt-4">
          <h3>後台管理</h3>
          <div class="row g-4 justify-content-center mt-2 mb-5">
            <div class="col-md-4">
              <router-link to="/admin/movies" class="management-card">
                <div class="card">
                  <div class="card-body">
                    <i class="fas fa-film"></i>
                    <h4>電影管理</h4>
                    <p>管理電影資訊與場次</p>
                  </div>
                </div>
              </router-link>
            </div>

            <div class="col-md-4">
              <router-link to="/admin/users" class="management-card">
                <div class="card">
                  <div class="card-body">
                    <i class="fas fa-users"></i>
                    <h4>會員管理</h4>
                    <p>管理會員資料與權限</p>
                  </div>
                </div>
              </router-link>
            </div>

            <div class="col-md-4">
              <router-link to="/admin/stores" class="management-card">
                <div class="card">
                  <div class="card-body">
                    <i class="fas fa-store"></i>
                    <h4>商店管理</h4>
                    <p>管理特約商店</p>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <!-- 統計卡片 -->
        <div class="row g-4 mb-4">
          <div class="col-md-4">
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

          <div class="col-md-4">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-store"></i>
              </div>
              <div class="stat-info">
                <h3>特約商店數</h3>
                <div class="stat-value">{{ stats.totalStores }}</div>
                <div class="stat-change">
                  <i class="fas fa-arrow-up"></i>
                  {{ stats.newStores }} 新增
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-film"></i>
              </div>
              <div class="stat-info">
                <h3>上映電影數</h3>
                <div class="stat-value">{{ stats.activeMovies }}</div>
                <div class="stat-change">
                  <i class="fas fa-arrow-up"></i>
                  {{ stats.newMovies }} 新增
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 圖表區域 -->
        <div class="row g-4">
          <div class="col-md-6">
            <div class="chart-card">
              <h3>會員分析</h3>
              <canvas ref="userChartRef"></canvas>
            </div>
          </div>

          <div class="col-md-6">
            <div class="chart-card">
              <h3>商店類型分析</h3>
              <canvas ref="storeChartRef"></canvas>
            </div>
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

    const initCharts = (userRoleData, storeCategoryData) => {
      try {
        if (userChart) userChart.destroy()
        if (storeChart) storeChart.destroy()

        if (userChartRef.value && userRoleData) {
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

        if (storeChartRef.value && storeCategoryData) {
          const storeCtx = storeChartRef.value.getContext('2d')
          storeChart = new Chart(storeCtx, {
            type: 'pie',
            data: {
              labels: Object.keys(storeCategoryData),
              datasets: [{
                data: Object.values(storeCategoryData),
                backgroundColor: [
                  '#FF6384', '#36A2EB', '#FFCE56',
                  '#4BC0C0', '#9966FF'
                ]
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

    const fetchDashboardData = async () => {
      try {
        isLoading.value = true
        error.value = null
        isDataLoaded.value = false

        const response = await store.dispatch('admin/fetchDashboardData')

        if (!response || typeof response !== 'object') {
          throw new Error('無效的響應數據')
        }

        if (response.error) {
          throw new Error(response.error)
        }

        if (!response.data) {
          throw new Error('數據格式錯誤')
        }

        stats.value = {
          totalUsers: response.data.totalUsers || 0,
          newUsers: response.data.newUsers || 0,
          totalStores: response.data.totalStores || 0,
          newStores: response.data.newStores || 0,
          activeMovies: response.data.activeMovies || 0,
          newMovies: response.data.newMovies || 0
        }

        if (response.data.userRoleDistribution && response.data.storeCategoryDistribution) {
          initCharts(
              response.data.userRoleDistribution,
              response.data.storeCategoryDistribution
          )
        } else {
          console.warn('缺少圖表數據')
        }

        isDataLoaded.value = true
      } catch (err) {
        console.error('Dashboard error:', err)
        error.value = '載入儀表板數據失敗: ' + err.message
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
      isDataLoaded
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
