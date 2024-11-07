<template>
  <div class="transactions-page">
    <div class="container">
      <!-- 載入中狀態 -->
      <LoadingSpinner v-if="isLoading" />

      <!-- 錯誤提示 -->
      <AlertMessage
          v-if="error"
          type="error"
          :message="error"
          @close="error = null"
      />

      <div class="transactions-content">
        <h2 class="page-title mb-4">交易記錄</h2>

        <!-- 篩選工具列 -->
        <div class="filter-toolbar mb-4">
          <div class="row g-3">
            <!-- 日期範圍選擇 -->
            <div class="col-md-4">
              <label class="form-label">日期範圍</label>
              <select
                  class="form-select"
                  v-model="selectedDateRange"
                  @change="handleDateRangeChange"
              >
                <option
                    v-for="range in dateRanges"
                    :key="range.value"
                    :value="range.value"
                >
                  {{ range.label }}
                </option>
              </select>
            </div>

            <!-- 交易類型選擇 -->
            <div class="col-md-4">
              <label class="form-label">交易類型</label>
              <select
                  class="form-select"
                  v-model="selectedType"
                  @change="handleFilterChange"
              >
                <option value="">全部類型</option>
                <option
                    v-for="type in transactionTypes"
                    :key="type.value"
                    :value="type.value"
                >
                  {{ type.label }}
                </option>
              </select>
            </div>

            <!-- 搜尋框 -->
            <div class="col-md-4">
              <label class="form-label">搜尋交易</label>
              <div class="input-group">
                <input
                    type="text"
                    class="form-control"
                    v-model="searchQuery"
                    placeholder="搜尋交易編號或描述"
                    @input="handleSearch"
                >
                <button
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="clearSearch"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 交易統計卡片 -->
        <div class="transaction-stats row g-4 mb-4">
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-icon income">
                <i class="fas fa-plus-circle"></i>
              </div>
              <div class="stat-info">
                <h3>收入總額</h3>
                <div class="stat-value text-success">
                  NT$ {{ formatNumber(stats.totalIncome) }}
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-icon expense">
                <i class="fas fa-minus-circle"></i>
              </div>
              <div class="stat-info">
                <h3>支出總額</h3>
                <div class="stat-value text-danger">
                  NT$ {{ formatNumber(stats.totalExpense) }}
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-exchange-alt"></i>
              </div>
              <div class="stat-info">
                <h3>交易筆數</h3>
                <div class="stat-value">
                  {{ stats.totalTransactions }} 筆
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
                <h3>目前餘額</h3>
                <div class="stat-value">
                  NT$ {{ formatNumber(currentBalance) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 交易列表 -->
        <div class="transaction-list">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
              <tr>
                <th>交易時間</th>
                <th>交易編號</th>
                <th>類型</th>
                <th>描述</th>
                <th class="text-end">金額</th>
                <th class="text-end">餘額</th>
                <th>狀態</th>
              </tr>
              </thead>
              <tbody>
              <tr v-if="transactions.length === 0">
                <td colspan="7" class="text-center py-4">
                  <div class="no-data">
                    <i class="fas fa-inbox fa-2x mb-2"></i>
                    <p class="text-muted">暫無交易記錄</p>
                  </div>
                </td>
              </tr>
              <tr
                  v-for="transaction in transactions"
                  :key="transaction.id"
                  @click="showTransactionDetail(transaction)"
                  style="cursor: pointer;"
              >
                <td>{{ formatDateTime(transaction.createdAt) }}</td>
                <td>{{ transaction.transactionNumber }}</td>
                <td>
                    <span
                        class="badge"
                        :class="getTransactionTypeClass(transaction.type)"
                    >
                      {{ getTransactionTypeLabel(transaction.type) }}
                    </span>
                </td>
                <td>{{ transaction.description }}</td>
                <td
                    class="text-end"
                    :class="getAmountClass(transaction.amount)"
                >
                  {{ formatAmount(transaction.amount) }}
                </td>
                <td class="text-end">
                  NT$ {{ formatNumber(transaction.balance) }}
                </td>
                <td>
                    <span
                        class="badge"
                        :class="getStatusClass(transaction.status)"
                    >
                      {{ getStatusText(transaction.status) }}
                    </span>
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <!-- 分頁 -->
          <nav v-if="totalPages > 1" class="mt-4">
            <ul class="pagination justify-content-center">
              <li
                  class="page-item"
                  :class="{ disabled: currentPage === 1 }"
              >
                <button
                    class="page-link"
                    @click="changePage(currentPage - 1)"
                >
                  <i class="fas fa-chevron-left"></i>
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
                  :class="{ disabled: currentPage === totalPages }"
              >
                <button
                    class="page-link"
                    @click="changePage(currentPage + 1)"
                >
                  <i class="fas fa-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- 交易詳情Modal -->
    <div
        class="modal fade"
        id="transactionModal"
        tabindex="-1"
        ref="transactionModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">交易詳情</h5>
            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body" v-if="selectedTransaction">
            <div class="transaction-detail">
              <div class="detail-item">
                <label>交易編號：</label>
                <span>{{ selectedTransaction.transactionNumber }}</span>
              </div>
              <div class="detail-item">
                <label>交易時間：</label>
                <span>{{ formatDateTime(selectedTransaction.createdAt) }}</span>
              </div>
              <div class="detail-item">
                <label>交易類型：</label>
                <span
                    class="badge"
                    :class="getTransactionTypeClass(selectedTransaction.type)"
                >
                  {{ getTransactionTypeLabel(selectedTransaction.type) }}
                </span>
              </div>
              <div class="detail-item">
                <label>交易金額：</label>
                <span :class="getAmountClass(selectedTransaction.amount)">
                  {{ formatAmount(selectedTransaction.amount) }}
                </span>
              </div>
              <div class="detail-item">
                <label>交易後餘額：</label>
                <span>NT$ {{ formatNumber(selectedTransaction.balance) }}</span>
              </div>
              <div class="detail-item">
                <label>交易狀態：</label>
                <span
                    class="badge"
                    :class="getStatusClass(selectedTransaction.status)"
                >
                  {{ getStatusText(selectedTransaction.status) }}
                </span>
              </div>
              <div class="detail-item">
                <label>交易描述：</label>
                <span>{{ selectedTransaction.description }}</span>
              </div>
              <div class="detail-item" v-if="selectedTransaction.remarks">
                <label>備註：</label>
                <span>{{ selectedTransaction.remarks }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { Modal } from 'bootstrap'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'

export default {
  name: 'Transactions',

  components: {
    LoadingSpinner,
    AlertMessage
  },

  setup() {
    const store = useStore()
    const transactionModal = ref(null)

    // 狀態
    const isLoading = ref(false)
    const error = ref(null)
    const currentPage = ref(1)
    const selectedTransaction = ref(null)
    const searchQuery = ref('')
    const selectedDateRange = ref('last7days')
    const selectedType = ref('')

    // 日期範圍選項
    const dateRanges = [
      { label: '最近7天', value: 'last7days' },
      { label: '最近30天', value: 'last30days' },
      { label: '最近3個月', value: 'last3months' },
      { label: '最近6個月', value: 'last6months' },
      { label: '今年', value: 'thisYear' }
    ]

    // 交易類型選項
    const transactionTypes = [
      { label: '儲值', value: 'DEPOSIT', icon: 'fa-plus-circle' },
      { label: '消費', value: 'PAYMENT', icon: 'fa-shopping-cart' },
      { label: '退款', value: 'REFUND', icon: 'fa-undo' },
      { label: '轉帳', value: 'TRANSFER', icon: 'fa-exchange-alt' }
    ]

    // 計算屬性
    const currentBalance = computed(() => store.state.wallet.balance)
    const transactions = computed(() => store.state.wallet.transactions)
    const totalPages = computed(() => store.state.wallet.totalPages)
    const stats = computed(() => ({
      totalIncome: store.state.wallet.stats.totalIncome || 0,
      totalExpense: store.state.wallet.stats.totalExpense || 0,
      totalTransactions: store.state.wallet.stats.totalTransactions || 0
    }))

    // 顯示的分頁號碼
    const displayedPages = computed(() => {
      const delta = 2
      const range = []
      for (
          let i = Math.max(1, currentPage.value - delta);
          i <= Math.min(totalPages.value, currentPage.value + delta);
          i++
      ) {
        range.push(i)
      }
      return range
    })

    // 獲取交易記錄
    const fetchTransactions = async () => {
      try {
        isLoading.value = true
        error.value = null
        await store.dispatch('wallet/fetchTransactions', {
          page: currentPage.value,
          dateRange: selectedDateRange.value,
          type: selectedType.value,
          search: searchQuery.value
        })
      } catch (err) {
        error.value = '載入交易記錄失敗'
        console.error('Fetch transactions error:', err)
      } finally {
        isLoading.value = false
      }
    }

    // 換頁
    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        fetchTransactions()
      }
    }

    // 處理日期範圍變更
    const handleDateRangeChange = () => {
      currentPage.value = 1
      fetchTransactions()
    }

    // 處理篩選變更
    const handleFilterChange = () => {
      currentPage.value = 1
      fetchTransactions()
    }

    // 處理搜尋
    const handleSearch = () => {
      currentPage.value = 1
      fetchTransactions()
    }

    // 清除搜尋
    const clearSearch = () => {
      searchQuery.value = ''
      handleSearch()
    }

    // 顯示交易詳情
    const showTransactionDetail = (transaction) => {
      selectedTransaction.value = transaction
      const modal = new Modal(transactionModal.value)
      modal.show()
    }

    // 格式化數字
    const formatNumber = (number) => {
      return number?.toLocaleString('zh-TW') || '0'
    }

    // 格式化日期時間
    const formatDateTime = (datetime) => {
      return new Date(datetime).toLocaleString('zh-TW')
    }

    // 格式化金額
    const formatAmount = (amount) => {
      const prefix = amount >= 0 ? '+' : ''
      return `${prefix}NT$ ${formatNumber(Math.abs(amount))}`
    }

    // 獲取交易類型樣式
    const getTransactionTypeClass = (type) => {
      switch (type) {
      case 'DEPOSIT':
        return 'bg-success'
      case 'PAYMENT':
        return 'bg-danger'
      case 'REFUND':
        return 'bg-info'
      case 'TRANSFER':
        return 'bg-warning'
      default:
        return 'bg-secondary'
      }
    }

    // 獲取交易類型標籤
    const getTransactionTypeLabel = (type) => {
      const found = transactionTypes.find(t => t.value === type)
      return found ? found.label : '未知'
    }

    // 獲取金額樣式
    const getAmountClass = (amount) => {
      return amount >= 0 ? 'text-success' : 'text-danger'
    }

    // 獲取狀態樣式
    const getStatusClass = (status) => {
      switch (status) {
      case 'COMPLETED':
        return 'bg-success'
      case 'PENDING':
        return 'bg-warning'
      case 'FAILED':
        return 'bg-danger'
      default:
        return 'bg-secondary'
      }
    }

    // 獲取狀態文字
    const getStatusText = (status) => {
      switch (status) {
      case 'COMPLETED':
        return '已完成'
      case 'PENDING':
        return '處理中'
      case 'FAILED':
        return '失敗'
      default:
        return '未知'
      }
    }

    onMounted(() => {
      fetchTransactions()
    })

    return {
      isLoading,
      error,
      currentPage,
      selectedTransaction,
      searchQuery,
      selectedDateRange,
      selectedType,
      dateRanges,
      transactionTypes,
      currentBalance,
      transactions,
      totalPages,
      stats,
      displayedPages,
      transactionModal,
      changePage,
      handleDateRangeChange,
      handleFilterChange,
      handleSearch,
      clearSearch,
      showTransactionDetail,
      formatNumber,
      formatDateTime,
      formatAmount,
      getTransactionTypeClass,
      getTransactionTypeLabel,
      getAmountClass,
      getStatusClass,
      getStatusText
    }
  }
}
</script>

<style scoped>
.transactions-page {
  padding: 2rem 0;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-color);
}

.filter-toolbar {
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
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
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-icon.income {
  background-color: var(--success-color);
}

.stat-icon.expense {
  background-color: var(--danger-color);
}

.stat-info h3 {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
}

.transaction-list {
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  margin-top: 1.5rem;
}

.table th {
  font-weight: 600;
  color: var(--text-secondary);
}

.table td {
  vertical-align: middle;
}

.badge {
  padding: 0.5rem 0.75rem;
  font-weight: 500;
}

.no-data {
  text-align: center;
  padding: 3rem 0;
}

.no-data i {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.transaction-detail .detail-item {
  margin-bottom: 1rem;
}

.transaction-detail .detail-item:last-child {
  margin-bottom: 0;
}

.transaction-detail label {
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
  display: block;
}

.pagination {
  margin-bottom: 0;
}

.page-link {
  padding: 0.5rem 1rem;
  color: var(--primary-color);
}

.page-item.active .page-link {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
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

  .transaction-list {
    padding: 1rem;
  }

  .badge {
    padding: 0.25rem 0.5rem;
  }
}
</style>
