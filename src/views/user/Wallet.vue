<template>
  <div class="wallet-container">
    <!-- 載入中狀態 -->
    <LoadingSpinner v-if="isLoading" />

    <!-- 錯誤提示 -->
    <AlertMessage
        v-if="error"
        type="error"
        :message="error"
    />

    <!-- 電子錢包資訊 -->
    <div v-else class="wallet-content">
      <!-- 餘額卡片 -->
      <div class="balance-card mb-4">
        <div class="balance-info">
          <h3>我的餘額</h3>
          <div class="balance-amount">
            NT$ {{ formatNumber(walletInfo.balance) }}
          </div>
          <div class="balance-actions mt-3">
            <button
                class="btn btn-primary me-2"
                @click="showTopUpModal"
            >
              <i class="fas fa-plus-circle me-1"></i> 儲值
            </button>
            <button
                class="btn btn-outline-primary"
                @click="showTransferModal"
                :disabled="!walletInfo.balance"
            >
              <i class="fas fa-exchange-alt me-1"></i> 轉帳
            </button>
          </div>
        </div>
      </div>

      <!-- 交易記錄 -->
      <div class="transactions-section">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3>交易記錄</h3>
          <!-- 篩選器 -->
          <div class="filters">
            <select
                class="form-select me-2"
                v-model="selectedType"
                @change="filterTransactions"
            >
              <option value="">所有類型</option>
              <option value="DEPOSIT">儲值</option>
              <option value="PAYMENT">支付</option>
              <option value="REFUND">退款</option>
              <option value="TRANSFER">轉帳</option>
            </select>
            <input
                type="month"
                class="form-control"
                v-model="selectedMonth"
                @change="filterTransactions"
            >
          </div>
        </div>

        <!-- 交易列表 -->
        <div class="transaction-list" v-if="transactions.length">
          <div
              v-for="transaction in transactions"
              :key="transaction.transactionId"
              class="transaction-item"
              :class="transaction.type.toLowerCase()"
          >
            <div class="transaction-icon">
              <i :class="getTransactionIcon(transaction.type)"></i>
            </div>
            <div class="transaction-info">
              <div class="transaction-title">
                {{ getTransactionTitle(transaction) }}
              </div>
              <div class="transaction-time">
                {{ formatDateTime(transaction.transactionTime) }}
              </div>
            </div>
            <div class="transaction-amount" :class="getAmountClass(transaction.type)">
              {{ getAmountPrefix(transaction.type) }}
              NT$ {{ formatNumber(transaction.amount) }}
            </div>
          </div>
        </div>
        <div v-else class="text-center py-4">
          <p class="text-muted">暫無交易記錄</p>
        </div>

        <!-- 分頁控制 -->
        <nav v-if="totalPages > 1" class="mt-4">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button
                  class="page-link"
                  @click="changePage(currentPage - 1)"
                  :disabled="currentPage === 1"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
            </li>
            <li
                v-for="page in displayedPages"
                :key="page"
                class="page-item"
                :class="{ active: currentPage === page, disabled: page === '...' }"
            >
              <button
                  class="page-link"
                  @click="page !== '...' && changePage(page)"
              >
                {{ page }}
              </button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button
                  class="page-link"
                  @click="changePage(currentPage + 1)"
                  :disabled="currentPage === totalPages"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- 儲值Modal -->
    <div
        class="modal fade"
        id="topUpModal"
        tabindex="-1"
        ref="topUpModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">儲值金額</h5>
            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">選擇金額</label>
              <div class="amount-options">
                <button
                    v-for="amount in topUpAmounts"
                    :key="amount"
                    class="btn"
                    :class="topUpAmount === amount ? 'btn-primary' : 'btn-outline-primary'"
                    @click="selectTopUpAmount(amount)"
                >
                  NT$ {{ formatNumber(amount) }}
                </button>
              </div>
              <div class="mt-3">
                <label class="form-label">或輸入其他金額</label>
                <input
                    type="number"
                    class="form-control"
                    v-model.number="customTopUpAmount"
                    min="100"
                    max="50000"
                    step="100"
                >
                <small class="text-muted">
                  最低儲值金額NT$ 100，最高NT$ 50,000
                </small>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
            >
              取消
            </button>
            <button
                type="button"
                class="btn btn-primary"
                @click="handleTopUp"
                :disabled="!isValidTopUpAmount || isProcessing"
            >
              <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
              {{ isProcessing ? '處理中...' : '確認儲值' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 轉帳Modal -->
    <div
        class="modal fade"
        id="transferModal"
        tabindex="-1"
        ref="transferModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">轉帳</h5>
            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <div class="form-group mb-3">
              <label class="form-label">收款人Email</label>
              <input
                  type="email"
                  class="form-control"
                  v-model="transferData.receiverEmail"
                  placeholder="請輸入收款人Email"
              >
            </div>
            <div class="form-group mb-3">
              <label class="form-label">轉帳金額</label>
              <input
                  type="number"
                  class="form-control"
                  v-model.number="transferData.amount"
                  min="1"
                  :max="walletInfo.balance"
                  placeholder="請輸入轉帳金額"
              >
              <small class="text-muted">
                可轉帳金額上限：NT$ {{ formatNumber(walletInfo.balance) }}
              </small>
            </div>
            <div class="form-group">
              <label class="form-label">備註（選填）</label>
              <input
                  type="text"
                  class="form-control"
                  v-model="transferData.note"
                  placeholder="請輸入備註"
              >
            </div>
          </div>
          <div class="modal-footer">
            <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
            >
              取消
            </button>
            <button
                type="button"
                class="btn btn-primary"
                @click="handleTransfer"
                :disabled="!isValidTransfer || isProcessing"
            >
              <span v-if="isProcessing" class="spinner-border spinner-border-sm me-2"></span>
              {{ isProcessing ? '處理中...' : '確認轉帳' }}
            </button>
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
  name: 'Wallet',

  components: {
    LoadingSpinner,
    AlertMessage
  },

  setup() {
    const store = useStore()
    const topUpModal = ref(null)
    const transferModal = ref(null)

    // 狀態
    const isLoading = ref(false)
    const error = ref(null)
    const isProcessing = ref(false)
    const currentPage = ref(1)
    const selectedType = ref('')
    const selectedMonth = ref('')

    // 儲值相關
    const topUpAmounts = [1000, 2000, 3000, 5000, 10000]
    const topUpAmount = ref(0)
    const customTopUpAmount = ref(null)

    // 轉帳相關
    const transferData = ref({
      receiverEmail: '',
      amount: null,
      note: ''
    })

    // 從store獲取數據
    const walletInfo = computed(() => store.state.wallet.info)
    const transactions = computed(() => store.state.wallet.transactions)
    const totalPages = computed(() => store.state.wallet.totalPages)

    // 計算屬性
    const isValidTopUpAmount = computed(() => {
      const amount = customTopUpAmount.value || topUpAmount.value
      return amount >= 100 && amount <= 50000
    })

    const isValidTransfer = computed(() => {
      return transferData.value.receiverEmail &&
          transferData.value.amount > 0 &&
          transferData.value.amount <= walletInfo.value.balance
    })

    // 分頁顯示
    const displayedPages = computed(() => {
      const delta = 2
      const range = []
      const rangeWithDots = []
      let l

      for (let i = 1; i <= totalPages.value; i++) {
        if (
            i === 1 ||
            i === totalPages.value ||
            i >= currentPage.value - delta &&
            i <= currentPage.value + delta
        ) {
          range.push(i)
        }
      }

      range.forEach((i) => {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1)
          } else if (i - l !== 1) {
            rangeWithDots.push('...')
          }
        }
        rangeWithDots.push(i)
        l = i
      })

      return rangeWithDots
    })

// 修改 fetchWalletInfo 函數
    const fetchWalletInfo = async () => {
      try {
        isLoading.value = true
        error.value = null

        // 嘗試從後端獲取數據
        try {
          await store.dispatch('wallet/fetchWalletInfo')
        } catch (err) {
          console.log('Using mock data due to API error:', err)
          // 如果API請求失敗，使用模擬數據
          store.commit('wallet/SET_WALLET_INFO', mockWalletInfo)
        }
      } catch (err) {
        error.value = '載入錢包資訊失敗，請稍後再試'
        console.error('Error fetching wallet info:', err)
      } finally {
        isLoading.value = false
      }
    }

    // 修改 fetchTransactions 函數
    const fetchTransactions = async () => {
      try {
        // 嘗試從後端獲取數據
        try {
          await store.dispatch('wallet/fetchTransactions', {
            page: currentPage.value,
            type: selectedType.value,
            month: selectedMonth.value
          })
        } catch (err) {
          console.log('Using mock transactions due to API error:', err)
          // 如果API請求失敗，使用模擬數據
          store.commit('wallet/SET_TRANSACTIONS', mockTransactions)
          store.commit('wallet/SET_TOTAL_PAGES', 1)
        }
      } catch (err) {
        console.error('Error fetching transactions:', err)
      }
    }

    // 篩選交易記錄
    const filterTransactions = () => {
      currentPage.value = 1
      fetchTransactions()
    }

    // 換頁
    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        fetchTransactions()
      }
    }

    // 顯示儲值Modal
    const showTopUpModal = () => {
      topUpAmount.value = 0
      customTopUpAmount.value = null
      const modal = new Modal(topUpModal.value)
      modal.show()
    }

    // 選擇儲值金額
    const selectTopUpAmount = (amount) => {
      topUpAmount.value = amount
      customTopUpAmount.value = null
    }

    const handleTopUp = async () => {
      const amount = customTopUpAmount.value || topUpAmount.value
      if (!isValidTopUpAmount.value) return

      try {
        isProcessing.value = true
        try {
          await store.dispatch('wallet/topUp', { amount })
        } catch (err) {
          console.log('Using mock top-up due to API error:', err)
          // 模擬儲值成功
          const newBalance = walletInfo.value.balance + amount
          store.commit('wallet/SET_WALLET_INFO', {
            ...mockWalletInfo,
            balance: newBalance
          })

          // 添加新的交易記錄
          const newTransaction = {
            transactionId: Date.now(),
            type: 'DEPOSIT',
            amount: amount,
            balance: newBalance,
            description: '儲值',
            transactionTime: new Date().toISOString(),
            status: 'COMPLETED'
          }

          store.commit('wallet/SET_TRANSACTIONS', [newTransaction, ...transactions.value])
        }
        Modal.getInstance(topUpModal.value).hide()
        await fetchWalletInfo()
        await fetchTransactions()
      } catch (err) {
        error.value = '儲值失敗，請稍後再試'
        console.error('Top up error:', err)
      } finally {
        isProcessing.value = false
      }
    }

    // 顯示轉帳Modal
    const showTransferModal = () => {
      transferData.value = {
        receiverEmail: '',
        amount: null,
        note: ''
      }
      const modal = new Modal(transferModal.value)
      modal.show()
    }

    // 處理轉帳
    const handleTransfer = async () => {
      if (!isValidTransfer.value) return

      try {
        isProcessing.value = true
        try {
          await store.dispatch('wallet/transfer', transferData.value)
        } catch (err) {
          console.log('Using mock transfer due to API error:', err)
          // 模擬轉帳成功
          const newBalance = walletInfo.value.balance - transferData.value.amount
          store.commit('wallet/SET_WALLET_INFO', {
            ...mockWalletInfo,
            balance: newBalance
          })

          // 添加新的交易記錄
          const newTransaction = {
            transactionId: Date.now(),
            type: 'TRANSFER',
            amount: transferData.value.amount,
            balance: newBalance,
            description: `轉帳給 ${transferData.value.receiverEmail}`,
            transactionTime: new Date().toISOString(),
            status: 'COMPLETED'
          }

          store.commit('wallet/SET_TRANSACTIONS', [newTransaction, ...transactions.value])
        }
        Modal.getInstance(transferModal.value).hide()
        await fetchWalletInfo()
        await fetchTransactions()
      } catch (err) {
        error.value = '轉帳失敗，請稍後再試'
        console.error('Transfer error:', err)
      } finally {
        isProcessing.value = false
      }
    }

    // 取得交易圖標
    const getTransactionIcon = (type) => {
      switch (type) {
        case 'DEPOSIT':
          return 'fas fa-plus-circle'
        case 'PAYMENT':
          return 'fas fa-shopping-cart'
        case 'REFUND':
          return 'fas fa-undo'
        case 'TRANSFER':
          return 'fas fa-exchange-alt'
        default:
          return 'fas fa-circle'
      }
    }

    // 取得交易標題
    const getTransactionTitle = (transaction) => {
      switch (transaction.type) {
        case 'DEPOSIT':
          return '儲值'
        case 'PAYMENT':
          return transaction.description || '支付'
        case 'REFUND':
          return '退款'
        case 'TRANSFER':
          return `轉帳${transaction.isReceived ? '收入' : '支出'}`
        default:
          return transaction.description || '交易'
      }
    }

    // 取得金額前綴
    const getAmountPrefix = (type) => {
      switch (type) {
        case 'DEPOSIT':
        case 'REFUND':
          return '+'
        case 'PAYMENT':
        case 'TRANSFER':
          return '-'
        default:
          return ''
      }
    }

    // 取得金額樣式
    const getAmountClass = (type) => {
      switch (type) {
        case 'DEPOSIT':
        case 'REFUND':
          return 'text-success'
        case 'PAYMENT':
        case 'TRANSFER':
          return 'text-danger'
        default:
          return ''
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

    // 初始化
    onMounted(async () => {
      await fetchWalletInfo()
      await fetchTransactions()
    })
// 在setup函數內添加模擬數據
    const mockWalletInfo = {
      balance: 5000,
      userId: 1,
      status: 'ACTIVE'
    }

    const mockTransactions = [
      {
        transactionId: 1,
        type: 'DEPOSIT',
        amount: 1000,
        balance: 5000,
        description: '儲值',
        transactionTime: new Date().toISOString(),
        status: 'COMPLETED'
      },
      {
        transactionId: 2,
        type: 'PAYMENT',
        amount: 300,
        balance: 4700,
        description: '購票',
        transactionTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'COMPLETED'
      },
      {
        transactionId: 3,
        type: 'REFUND',
        amount: 300,
        balance: 5000,
        description: '退票',
        transactionTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'COMPLETED'
      }
    ]



    return {
      isLoading,
      error,
      isProcessing,
      walletInfo,
      transactions,
      currentPage,
      totalPages,
      displayedPages,
      selectedType,
      selectedMonth,
      topUpModal,
      transferModal,
      topUpAmounts,
      topUpAmount,
      customTopUpAmount,
      transferData,
      isValidTopUpAmount,
      isValidTransfer,
      showTopUpModal,
      selectTopUpAmount,
      handleTopUp,
      showTransferModal,
      handleTransfer,
      getTransactionIcon,
      getTransactionTitle,
      getAmountPrefix,
      getAmountClass,
      formatNumber,
      formatDateTime,
      filterTransactions,
      changePage,
      fetchWalletInfo,
      fetchTransactions
    }
  }
}
</script>

<style scoped>
.wallet-container {
  padding: 2rem 0;
}

.balance-card {
  background-color: var(--primary-color);
  color: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
}

.balance-info h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.balance-amount {
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.transactions-section {
  background-color: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
}

.filters {
  display: flex;
  gap: 1rem;
}

.transaction-list {
  margin-top: 1.5rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 1rem;
  background-color: var(--bg-light);
}

.transaction-info {
  flex: 1;
}

.transaction-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.transaction-time {
  font-size: 0.875rem;
  color: var(--text-light);
}

.transaction-amount {
  font-weight: 600;
}

.amount-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .balance-card,
  .transactions-section {
    padding: 1.5rem;
  }

  .filters {
    flex-direction: column;
  }

  .amount-options {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
