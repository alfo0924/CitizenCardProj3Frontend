<template>
  <div class="modal fade" id="promotionStatsModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <!-- Modal Header -->
        <div class="modal-header">
          <h5 class="modal-title">活動統計資料</h5>
          <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
          ></button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <div v-if="promotion" class="stats-container">
            <!-- 活動基本資訊 -->
            <div class="promotion-info mb-4">
              <h6 class="promotion-title">{{ promotion.title }}</h6>
              <div class="promotion-period">
                {{ formatDate(promotion.startDate) }} - {{ formatDate(promotion.endDate) }}
              </div>
            </div>

            <!-- 主要統計數據 -->
            <div class="row stats-cards mb-4">
              <div class="col-md-3 col-6">
                <div class="stats-card">
                  <div class="stats-icon">
                    <i class="bi bi-people-fill"></i>
                  </div>
                  <div class="stats-data">
                    <div class="stats-value">{{ stats.participantCount }}</div>
                    <div class="stats-label">參與人數</div>
                  </div>
                </div>
              </div>
              <div class="col-md-3 col-6">
                <div class="stats-card">
                  <div class="stats-icon">
                    <i class="bi bi-heart-fill"></i>
                  </div>
                  <div class="stats-data">
                    <div class="stats-value">{{ stats.favoriteCount }}</div>
                    <div class="stats-label">收藏數</div>
                  </div>
                </div>
              </div>
              <div class="col-md-3 col-6">
                <div class="stats-card">
                  <div class="stats-icon">
                    <i class="bi bi-share-fill"></i>
                  </div>
                  <div class="stats-data">
                    <div class="stats-value">{{ stats.shareCount }}</div>
                    <div class="stats-label">分享次數</div>
                  </div>
                </div>
              </div>
              <div class="col-md-3 col-6">
                <div class="stats-card">
                  <div class="stats-icon">
                    <i class="bi bi-eye-fill"></i>
                  </div>
                  <div class="stats-data">
                    <div class="stats-value">{{ stats.viewCount }}</div>
                    <div class="stats-label">瀏覽次數</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 圖表區域 -->
            <div class="charts-section">
              <!-- 參與趨勢圖 -->
              <div class="chart-container mb-4">
                <h6 class="chart-title">參與趨勢</h6>
                <div class="chart-wrapper">
                  <canvas ref="participationChart"></canvas>
                </div>
              </div>

              <!-- 年齡分佈圖 -->
              <div class="chart-container mb-4">
                <h6 class="chart-title">參與者年齡分佈</h6>
                <div class="chart-wrapper">
                  <canvas ref="ageChart"></canvas>
                </div>
              </div>

              <!-- 性別分佈圖 -->
              <div class="chart-container mb-4">
                <h6 class="chart-title">參與者性別分佈</h6>
                <div class="chart-wrapper">
                  <canvas ref="genderChart"></canvas>
                </div>
              </div>
            </div>

            <!-- 詳細數據表格 -->
            <div class="data-table-section">
              <h6 class="section-title">參與者清單</h6>
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                  <tr>
                    <th>會員ID</th>
                    <th>參與時間</th>
                    <th>狀態</th>
                    <th>來源</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="record in stats.participationRecords" :key="record.id">
                    <td>{{ record.userId }}</td>
                    <td>{{ formatDateTime(record.participateTime) }}</td>
                    <td>
                        <span :class="['badge', getStatusClass(record.status)]">
                          {{ getStatusText(record.status) }}
                        </span>
                    </td>
                    <td>{{ record.source }}</td>
                  </tr>
                  </tbody>
                </table>
              </div>

              <!-- 分頁控制 -->
              <nav v-if="stats.totalPages > 1" class="mt-3">
                <ul class="pagination justify-content-center">
                  <li
                      class="page-item"
                      :class="{ disabled: currentPage === 1 }"
                  >
                    <button
                        class="page-link"
                        @click="changePage(currentPage - 1)"
                    >
                      上一頁
                    </button>
                  </li>
                  <li
                      v-for="page in displayedPages"
                      :key="page"
                      class="page-item"
                      :class="{ active: currentPage === page }"
                  >
                    <button
                        class="page-link"
                        @click="changePage(page)"
                    >
                      {{ page }}
                    </button>
                  </li>
                  <li
                      class="page-item"
                      :class="{ disabled: currentPage === stats.totalPages }"
                  >
                    <button
                        class="page-link"
                        @click="changePage(currentPage + 1)"
                    >
                      下一頁
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          <!-- 載入中提示 -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">載入中...</span>
            </div>
          </div>

          <!-- 錯誤提示 -->
          <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
          >
            關閉
          </button>
          <button
              type="button"
              class="btn btn-primary"
              @click="exportData"
              :disabled="exporting"
          >
            <span
                class="spinner-border spinner-border-sm me-1"
                v-if="exporting"
            ></span>
            {{ exporting ? '匯出中...' : '匯出統計資料' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Modal } from 'bootstrap'
import Chart from 'chart.js/auto'

export default {
  name: 'PromotionStatsModal',

  props: {
    promotion: {
      type: Object,
      default: null
    }
  },

  setup(props) {
    // 狀態管理
    const loading = ref(false)
    const error = ref('')
    const exporting = ref(false)
    const currentPage = ref(1)
    const stats = ref({
      participantCount: 0,
      favoriteCount: 0,
      shareCount: 0,
      viewCount: 0,
      participationRecords: [],
      totalPages: 0
    })

    // Chart 實例
    let participationChart = null
    let ageChart = null
    let genderChart = null

    // Chart 參考
    const participationChartRef = ref(null)
    const ageChartRef = ref(null)
    const genderChartRef = ref(null)

    // Modal 實例
    let modalInstance = null

    // 監聽 promotion 變化
    watch(() => props.promotion, async (newVal) => {
      if (newVal) {
        await fetchStats()
      }
    })

    // 方法
    const fetchStats = async () => {
      if (!props.promotion) return

      loading.value = true
      error.value = ''

      try {
        const response = await fetch(`/api/promotions/${props.promotion.id}/stats?page=${currentPage.value}`)
        const data = await response.json()

        stats.value = data
        initCharts()
      } catch (err) {
        error.value = '載入統計資料失敗'
        console.error('Error fetching stats:', err)
      } finally {
        loading.value = false
      }
    }

    const initCharts = () => {
      // 清除舊的圖表
      if (participationChart) participationChart.destroy()
      if (ageChart) ageChart.destroy()
      if (genderChart) genderChart.destroy()

      // 參與趨勢圖
      participationChart = new Chart(participationChartRef.value, {
        type: 'line',
        data: {
          labels: stats.value.participationTrend.map(item => item.date),
          datasets: [{
            label: '每日參與人數',
            data: stats.value.participationTrend.map(item => item.count),
            borderColor: '#0d6efd',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      })

      // 年齡分佈圖
      ageChart = new Chart(ageChartRef.value, {
        type: 'bar',
        data: {
          labels: stats.value.ageDistribution.map(item => item.range),
          datasets: [{
            label: '年齡分佈',
            data: stats.value.ageDistribution.map(item => item.count),
            backgroundColor: '#0dcaf0'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      })

      // 性別分佈圖
      genderChart = new Chart(genderChartRef.value, {
        type: 'doughnut',
        data: {
          labels: ['男性', '女性', '其他'],
          datasets: [{
            data: [
              stats.value.genderDistribution.male,
              stats.value.genderDistribution.female,
              stats.value.genderDistribution.other
            ],
            backgroundColor: ['#0d6efd', '#dc3545', '#6c757d']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      })
    }

    const changePage = async (page) => {
      currentPage.value = page
      await fetchStats()
    }

    const exportData = async () => {
      if (!props.promotion) return

      exporting.value = true
      try {
        const response = await fetch(`/api/promotions/${props.promotion.id}/stats/export`)
        const blob = await response.blob()

        // 建立下載連結
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `promotion-stats-${props.promotion.id}.xlsx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } catch (err) {
        error.value = '匯出失敗'
        console.error('Error exporting stats:', err)
      } finally {
        exporting.value = false
      }
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-TW')
    }

    const formatDateTime = (date) => {
      return new Date(date).toLocaleString('zh-TW')
    }

    const getStatusClass = (status) => {
      const statusMap = {
        'completed': 'bg-success',
        'pending': 'bg-warning',
        'failed': 'bg-danger'
      }
      return statusMap[status] || 'bg-secondary'
    }

    const getStatusText = (status) => {
      const statusMap = {
        'completed': '完成',
        'pending': '處理中',
        'failed': '失敗'
      }
      return statusMap[status] || status
    }

    // 生命週期鉤子
    onMounted(() => {
      modalInstance = new Modal(document.getElementById('promotionStatsModal'))
    })

    onBeforeUnmount(() => {
      if (participationChart) participationChart.destroy()
      if (ageChart) ageChart.destroy()
      if (genderChart) genderChart.destroy()
      if (modalInstance) modalInstance.dispose()
    })

    return {
      loading,
      error,
      exporting,
      stats,
      currentPage,
      participationChartRef,
      ageChartRef,
      genderChartRef,
      changePage,
      exportData,
      formatDate,
      formatDateTime,
      getStatusClass,
      getStatusText
    }
  }
}
</script>

<style scoped>
.stats-container {
  padding: 1rem;
}

.promotion-info {
  text-align: center;
}

.promotion-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.promotion-period {
  color: #6c757d;
}

.stats-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  height: 100%;
}

.stats-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #0d6efd;
}

.stats-value {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.stats-label {
  color: #6c757d;
  font-size: 0.875rem;
}

.chart-container {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.chart-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #dee2e6;
}

.chart-wrapper {
  height: 300px;
  position: relative;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.table th {
  font-weight: 600;
  white-space: nowrap;
}

.badge {
  font-weight: 500;
}

@media (max-width: 768px) {
  .stats-cards {
    margin-bottom: 1rem;
  }

  .stats-card {
    margin-bottom: 1rem;
  }

  .chart-wrapper {
    height: 200px;
  }
}
</style>
