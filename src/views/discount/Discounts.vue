<template>
  <div class="discounts-container">
    <!-- 載入中狀態 -->
    <LoadingSpinner v-if="isLoading" />

    <!-- 錯誤提示 -->
    <AlertMessage
        v-if="error"
        type="error"
        :message="error"
    />

    <!-- 優惠列表 -->
    <div v-else class="discounts-content">
      <!-- 搜尋和篩選 -->
      <div class="filters mb-4">
        <div class="row g-3">
          <div class="col-md-4">
            <input
                type="text"
                class="form-control"
                placeholder="搜尋優惠"
                v-model="searchKeyword"
                @input="handleSearch"
            >
          </div>
          <div class="col-md-3">
            <select
                class="form-select"
                v-model="selectedType"
                @change="filterDiscounts"
            >
              <option value="">所有類型</option>
              <option value="CASH">現金折扣</option>
              <option value="PERCENTAGE">折扣優惠</option>
              <option value="FIXED">固定折抵</option>
            </select>
          </div>
          <div class="col-md-3">
            <select
                class="form-select"
                v-model="selectedStatus"
                @change="filterDiscounts"
            >
              <option value="">所有狀態</option>
              <option value="ACTIVE">可使用</option>
              <option value="USED">已使用</option>
              <option value="EXPIRED">已過期</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 優惠卡片列表 -->
      <div class="row g-4">
        <div
            v-for="discount in discounts"
            :key="discount.id"
            class="col-md-6 col-lg-4"
        >
          <div
              class="discount-card"
              :class="{
              'expired': isExpired(discount),
              'used': discount.status === 'USED'
            }"
          >
            <div class="discount-type">
              {{ getDiscountType(discount.type) }}
            </div>
            <div class="discount-content">
              <h3 class="discount-title">{{ discount.title }}</h3>
              <p class="discount-description">{{ discount.description }}</p>
              <div class="discount-value">
                {{ formatDiscountValue(discount) }}
              </div>
              <div class="discount-period">
                <i class="fas fa-calendar-alt"></i>
                {{ formatDate(discount.startDate) }} - {{ formatDate(discount.endDate) }}
              </div>
              <div class="discount-conditions" v-if="discount.conditions">
                <small>使用條件：{{ discount.conditions }}</small>
              </div>
            </div>
            <div class="discount-actions">
              <button
                  class="btn btn-primary"
                  :disabled="!canUseDiscount(discount)"
                  @click="useDiscount(discount)"
              >
                {{ getActionButtonText(discount) }}
              </button>
            </div>
          </div>
        </div>
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
                :disabled="currentPage === 1"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
          </li>
          <li
              v-for="page in displayedPages"
              :key="page"
              class="page-item"
              :class="{
              active: currentPage === page,
              disabled: page === '...'
            }"
          >
            <button
                class="page-link"
                @click="page !== '...' && changePage(page)"
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
                :disabled="currentPage === totalPages"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'

export default {
  name: 'Discounts',

  components: {
    LoadingSpinner,
    AlertMessage
  },

  setup() {
    const store = useStore()

    // 狀態
    const isLoading = ref(false)
    const error = ref(null)
    const searchKeyword = ref('')
    const selectedType = ref('')
    const selectedStatus = ref('')
    const currentPage = ref(1)

    // 從store獲取數據
    const discounts = computed(() => store.state.discount.discounts)
    const totalPages = computed(() => store.state.discount.totalPages)

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

      range.forEach(i => {
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

    // 獲取優惠列表
    const fetchDiscounts = async () => {
      try {
        isLoading.value = true
        error.value = null
        await store.dispatch('discount/fetchDiscounts', {
          page: currentPage.value,
          type: selectedType.value,
          status: selectedStatus.value,
          keyword: searchKeyword.value
        })
      } catch (err) {
        error.value = '載入優惠列表失敗，請稍後再試'
        console.error('Error fetching discounts:', err)
      } finally {
        isLoading.value = false
      }
    }

    // 搜尋處理
    const handleSearch = () => {
      currentPage.value = 1
      fetchDiscounts()
    }

    // 篩選處理
    const filterDiscounts = () => {
      currentPage.value = 1
      fetchDiscounts()
    }

    // 換頁
    const changePage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        fetchDiscounts()
      }
    }

    // 檢查優惠是否過期
    const isExpired = (discount) => {
      return new Date(discount.endDate) < new Date()
    }

    // 檢查優惠是否可用
    const canUseDiscount = (discount) => {
      return discount.status === 'ACTIVE' && !isExpired(discount)
    }

    // 使用優惠
    const useDiscount = async (discount) => {
      try {
        isLoading.value = true
        error.value = null
        await store.dispatch('discount/useDiscount', discount.id)
        await fetchDiscounts()
      } catch (err) {
        error.value = '使用優惠失敗，請稍後再試'
        console.error('Error using discount:', err)
      } finally {
        isLoading.value = false
      }
    }

    // 格式化優惠值
    const formatDiscountValue = (discount) => {
      switch (discount.type) {
        case 'CASH':
          return `NT$ ${discount.value}`
        case 'PERCENTAGE':
          return `${discount.value}% OFF`
        case 'FIXED':
          return `折抵 NT$ ${discount.value}`
        default:
          return discount.value
      }
    }

    // 獲取優惠類型文字
    const getDiscountType = (type) => {
      switch (type) {
        case 'CASH':
          return '現金折扣'
        case 'PERCENTAGE':
          return '折扣優惠'
        case 'FIXED':
          return '固定折抵'
        default:
          return '優惠'
      }
    }

    // 獲取按鈕文字
    const getActionButtonText = (discount) => {
      if (discount.status === 'USED') return '已使用'
      if (isExpired(discount)) return '已過期'
      return '立即使用'
    }

    // 格式化日期
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('zh-TW')
    }

    onMounted(() => {
      fetchDiscounts()
    })

    return {
      isLoading,
      error,
      discounts,
      searchKeyword,
      selectedType,
      selectedStatus,
      currentPage,
      totalPages,
      displayedPages,
      handleSearch,
      filterDiscounts,
      changePage,
      isExpired,
      canUseDiscount,
      useDiscount,
      formatDiscountValue,
      getDiscountType,
      getActionButtonText,
      formatDate
    }
  }
}
</script>

<style scoped>
.discounts-container {
  padding: 2rem 0;
}

.discount-card {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.discount-type {
  background: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.discount-content {
  padding: 1.5rem;
  flex: 1;
}

.discount-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.discount-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.discount-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.discount-period {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.discount-period i {
  margin-right: 0.5rem;
}

.discount-conditions {
  font-size: 0.75rem;
  color: var(--text-light);
}

.discount-actions {
  padding: 1rem 1.5rem;
  background: var(--bg-light);
  border-top: 1px solid var(--border-color);
}

.discount-card.expired {
  opacity: 0.7;
}

.discount-card.expired .discount-type {
  background: var(--secondary-color);
}

.discount-card.used .discount-type {
  background: var(--success-color);
}

@media (max-width: 768px) {
  .filters .row {
    row-gap: 1rem;
  }
}
</style>