<template>
  <div class="deposit-page">
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

      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="deposit-card">
            <h2 class="text-center mb-4">電子錢包儲值</h2>

            <!-- 目前餘額 -->
            <div class="balance-info mb-4">
              <h3>目前餘額</h3>
              <div class="current-balance">
                NT$ {{ formatNumber(currentBalance) }}
              </div>
            </div>

            <!-- 儲值表單 -->
            <form @submit.prevent="handleDeposit">
              <!-- 儲值金額選擇 -->
              <div class="amount-selection mb-4">
                <label class="form-label">選擇儲值金額</label>
                <div class="amount-buttons">
                  <button
                      v-for="amount in predefinedAmounts"
                      :key="amount"
                      type="button"
                      class="btn"
                      :class="[
                      depositAmount === amount
                        ? 'btn-primary'
                        : 'btn-outline-primary'
                    ]"
                      @click="selectAmount(amount)"
                  >
                    NT$ {{ formatNumber(amount) }}
                  </button>
                </div>

                <!-- 自訂金額 -->
                <div class="custom-amount mt-3">
                  <div class="input-group">
                    <span class="input-group-text">NT$</span>
                    <input
                        type="number"
                        class="form-control"
                        v-model.number="depositAmount"
                        :class="{ 'is-invalid': validationError }"
                        min="100"
                        max="50000"
                        step="100"
                        placeholder="輸入自訂金額"
                    >
                  </div>
                  <small class="text-muted">
                    單次儲值金額需介於 NT$ 100 ~ 50,000 之間
                  </small>
                  <div class="invalid-feedback" v-if="validationError">
                    {{ validationError }}
                  </div>
                </div>
              </div>

              <!-- 付款方式選擇 -->
              <div class="payment-method mb-4">
                <label class="form-label">選擇付款方式</label>
                <div class="payment-options">
                  <div
                      v-for="method in paymentMethods"
                      :key="method.value"
                      class="form-check"
                  >
                    <input
                        type="radio"
                        class="form-check-input"
                        :id="method.value"
                        :value="method.value"
                        v-model="selectedPaymentMethod"
                        required
                    >
                    <label class="form-check-label" :for="method.value">
                      <i :class="method.icon"></i>
                      {{ method.label }}
                    </label>
                  </div>
                </div>
              </div>

              <!-- 儲值按鈕 -->
              <button
                  type="submit"
                  class="btn btn-primary w-100"
                  :disabled="isLoading || !isValidAmount || !selectedPaymentMethod"
              >
                <span
                    v-if="isLoading"
                    class="spinner-border spinner-border-sm me-2"
                ></span>
                立即儲值 NT$ {{ formatNumber(depositAmount) }}
              </button>
            </form>

            <!-- 注意事項 -->
            <div class="deposit-notes mt-4">
              <h5>儲值須知：</h5>
              <ul class="small text-muted">
                <li>儲值金額將立即加入您的電子錢包餘額</li>
                <li>完成儲值後可於交易記錄中查詢儲值明細</li>
                <li>如遇儲值問題請聯繫客服人員協助處理</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 確認對話框 -->
    <div
        class="modal fade"
        id="confirmModal"
        tabindex="-1"
        ref="confirmModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">確認儲值</h5>
            <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <p>請確認以下儲值資訊：</p>
            <ul class="list-unstyled">
              <li>儲值金額：NT$ {{ formatNumber(depositAmount) }}</li>
              <li>付款方式：{{ getPaymentMethodLabel }}</li>
            </ul>
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
                @click="confirmDeposit"
                :disabled="isProcessing"
            >
              <span
                  v-if="isProcessing"
                  class="spinner-border spinner-border-sm me-2"
              ></span>
              確認儲值
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'

export default {
  name: 'Deposit',

  components: {
    LoadingSpinner,
    AlertMessage
  },

  setup() {
    const store = useStore()
    const router = useRouter()
    const confirmModal = ref(null)

    // 狀態
    const isLoading = ref(false)
    const isProcessing = ref(false)
    const error = ref(null)
    const depositAmount = ref(0)
    const selectedPaymentMethod = ref('')
    const currentBalance = ref(0)

    // 預設金額選項
    const predefinedAmounts = [500, 1000, 2000, 5000]

    // 付款方式選項
    const paymentMethods = [
      {
        value: 'CREDIT_CARD',
        label: '信用卡',
        icon: 'fas fa-credit-card'
      },
      {
        value: 'LINE_PAY',
        label: 'Line Pay',
        icon: 'fab fa-line'
      },
      {
        value: 'BANK_TRANSFER',
        label: '銀行轉帳',
        icon: 'fas fa-university'
      }
    ]

    // 取得付款方式標籤
    const getPaymentMethodLabel = computed(() => {
      const method = paymentMethods.find(
          m => m.value === selectedPaymentMethod.value
      )
      return method ? method.label : ''
    })

    // 驗證金額
    const validationError = computed(() => {
      if (!depositAmount.value) return '請輸入儲值金額'
      if (depositAmount.value < 100) return '最低儲值金額為 NT$ 100'
      if (depositAmount.value > 50000) return '最高儲值金額為 NT$ 50,000'
      if (depositAmount.value % 100 !== 0) return '儲值金額需為 100 的倍數'
      return null
    })

    const isValidAmount = computed(() => !validationError.value)

    // 選擇金額
    const selectAmount = (amount) => {
      depositAmount.value = amount
    }

    // 處理儲值
    const handleDeposit = () => {
      if (!isValidAmount.value) return

      const modal = new Modal(confirmModal.value)
      modal.show()
    }

    // 確認儲值
    const confirmDeposit = async () => {
      try {
        isProcessing.value = true
        error.value = null

        await store.dispatch('wallet/deposit', {
          amount: depositAmount.value,
          paymentMethod: selectedPaymentMethod.value
        })

        store.dispatch('setNotification', {
          type: 'success',
          message: '儲值成功！'
        })

        router.push('/wallet')
      } catch (err) {
        error.value = err.message || '儲值失敗，請稍後再試'
        Modal.getInstance(confirmModal.value).hide()
      } finally {
        isProcessing.value = false
      }
    }

    // 格式化數字
    const formatNumber = (number) => {
      return number.toLocaleString('zh-TW')
    }

    return {
      isLoading,
      isProcessing,
      error,
      depositAmount,
      selectedPaymentMethod,
      currentBalance,
      predefinedAmounts,
      paymentMethods,
      confirmModal,
      validationError,
      isValidAmount,
      getPaymentMethodLabel,
      selectAmount,
      handleDeposit,
      confirmDeposit,
      formatNumber
    }
  }
}
</script>

<style scoped>
.deposit-page {
  padding: 2rem 0;
}

.deposit-card {
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
}

.balance-info {
  text-align: center;
  padding: 1.5rem;
  background: var(--bg-light);
  border-radius: var(--border-radius-md);
}

.balance-info h3 {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.current-balance {
  font-size: 2rem;
  font-weight: 600;
  color: var(--primary-color);
}

.amount-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.amount-buttons .btn {
  padding: 1rem;
  font-weight: 500;
}

.payment-options {
  display: grid;
  gap: 1rem;
}

.form-check {
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
}

.form-check:hover {
  background: var(--bg-light);
}

.form-check-input:checked ~ .form-check-label {
  color: var(--primary-color);
}

.form-check-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  cursor: pointer;
}

.form-check-label i {
  font-size: 1.25rem;
}

.deposit-notes ul {
  padding-left: 1.25rem;
  margin-bottom: 0;
}

.deposit-notes li {
  margin-bottom: 0.5rem;
}

@media (max-width: 576px) {
  .deposit-card {
    padding: 1.5rem;
  }

  .amount-buttons {
    grid-template-columns: 1fr;
  }

  .current-balance {
    font-size: 1.5rem;
  }
}
</style>
