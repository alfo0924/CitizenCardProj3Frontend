<template>
  <div class="admin-dashboard">
    <div class="container">
      <LoadingSpinner v-if="isLoading" />

      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div v-else class="dashboard-content">
        <h1 class="dashboard-title">管理員儀表板</h1>

        <!-- 管理捷徑區塊 -->
        <div class="management-shortcuts">
          <div class="row g-4">
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

        <!-- 統計數據卡片 -->
        <div class="row g-4 mb-4">
          <div class="col-md-4" v-for="(stat, index) in statsCards" :key="index">
            <div class="stat-card">
              <div class="stat-icon">
                <i :class="stat.icon"></i>
              </div>
              <div class="stat-info">
                <h3>{{ stat.title }}</h3>
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-change" :class="{'positive': stat.change > 0}">
                  <i :class="stat.change > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
                  {{ stat.change }} 新增
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 圖表區塊 -->
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useStore } from 'vuex'
import Chart from 'chart.js/auto'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

export default {
  name: 'AdminDashboard',
  components: { LoadingSpinner },

  setup() {
    const store = useStore()
    const userChartRef = ref(null)
    const storeChartRef = ref(null)
    let userChart = null
    let storeChart = null
    const isLoading = ref(false)
    const error = ref(null)

    const stats = ref({
      totalUsers: 0,
      newUsers: 0,
      totalStores: 0,
      newStores: 0,
      activeMovies: 0,
      newMovies: 0
    })

    const managementItems = [
      {
        route: '/admin/users',
        icon: 'fas fa-users',
        title: '會員管理',
        description: '管理會員資料與權限'
      },
      {
        route: '/admin/stores',
        icon: 'fas fa-store',
        title: '商店管理',
        description: '管理特約商店資訊'
      },
      {
        route: '/admin/movies',
        icon: 'fas fa-film',
        title: '電影管理',
        description: '管理電影與場次'
      }
    ]

    const statsCards = computed(() => [
      {
        icon: 'fas fa-users',
        title: '總會員數',
        value: stats.value.totalUsers,
        change: stats.value.newUsers
      },
      {
        icon: 'fas fa-store',
        title: '特約商店',
        value: stats.value.totalStores,
        change: stats.value.newStores
      },
      {
        icon: 'fas fa-film',
        title: '上映電影',
        value: stats.value.activeMovies,
        change: stats.value.newMovies
      }
    ])

    const validateDashboardData = (data) => {
      if (!data || typeof data !== 'object') {
        throw new Error('無效的資料格式')
      }

      return {
        totalUsers: Number(data.totalUsers) || 0,
        newUsers: Number(data.newUsers) || 0,
        totalStores: Number(data.totalStores) || 0,
        newStores: Number(data.newStores) || 0,
        activeMovies: Number(data.activeMovies) || 0,
        newMovies: Number(data.newMovies) || 0,
        userRoleDistribution: data.userRoleDistribution || {},
        storeCategoryDistribution: data.storeCategoryDistribution || {}
      }
    }

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
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
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
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }
          })
        }
      } catch (err) {
        console.error('圖表初始化錯誤:', err)
        error.value = '圖表初始化失敗'
      }
    }

    // 修改 fetchDashboardData 方法
    const fetchDashboardData = async () => {
      try {
        isLoading.value = true;
        error.value = null;

        // 先檢查登入狀態
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('請先登入');
        }

        const response = await store.dispatch('admin/fetchDashboardData');

        if (!response?.success) {
          throw new Error(response?.error || '獲取儀表板數據失敗');
        }

        const validatedData = validateDashboardData(response.data);
        stats.value = validatedData;

        // 初始化圖表
        if (validatedData.userRoleDistribution && validatedData.storeCategoryDistribution) {
          initCharts(
              validatedData.userRoleDistribution,
              validatedData.storeCategoryDistribution
          );
        }
      } catch (err) {
        error.value = err.message;
        console.error('儀表板錯誤:', err);
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(async () => {
      await fetchDashboardData()
    })

    onUnmounted(() => {
      if (userChart) userChart.destroy()
      if (storeChart) storeChart.destroy()
    })

    return {
      isLoading,
      error,
      stats,
      managementItems,
      statsCards,
      userChartRef,
      storeChartRef
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  padding: 2rem 0;
  background-color: var(--bg-color-light);
  min-height: calc(100vh - 64px);
}

.dashboard-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 2rem;
  text-align: center;
}

.management-card {
  text-decoration: none;
  color: var(--text-color);
  display: block;
  transition: transform 0.3s ease;
}

.management-card .card {
  height: 100%;
  border: none;
  border-radius: 12px;
  box-shadow: var(--box-shadow);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.management-card:hover .card {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow-lg);
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
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

.chart-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: var(--box-shadow);
  height: 400px;
  margin-bottom: 2rem;
}

.chart-card h3 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  color: var(--text-color);
  text-align: center;
}

@media (max-width: 768px) {
  .dashboard-title {
    font-size: 1.5rem;
  }

  .chart-card {
    height: 300px;
  }

  .stat-card {
    padding: 1rem;
  }
}
</style>
